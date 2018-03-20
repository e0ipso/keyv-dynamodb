// @flow

import type {
  GetItemInput,
  GetItemOutput,
  PutItemInput,
  DeleteItemInput,
  ScanInput,
  ScanOutput,
  BatchWriteItemInput,
  DeleteRequest,
} from 'aws-sdk/clients/dynamodb';
import type { MapInterface } from '../types/keyv';
import type { KeyvDynamoDbOptions } from '../types/common';

const EventEmitter = require('events');
const { DynamoDB } = require('aws-sdk');
const pify = require('pify');
const Promise = require('bluebird');

/**
 * @var {number}
 *   Number of concurrent requests when clearing DynamoDB.
 */
const clearConcurrency = 100;

/**
 * DynamoDB store for the keyv project.
 */
class KeyvDynamoDb extends EventEmitter implements MapInterface {
  dynamo: DynamoDB;
  needsInit: boolean;
  tableName: string;

  /**
   * Constructs a KeyvDynamoDb object.
   *
   * @param {Object} opts
   *   KeyvDynamoDb options.
   */
  constructor(opts: KeyvDynamoDbOptions) {
    super();
    this.dynamo = new DynamoDB(opts.clientOptions);
    this.tableName = opts.tableName || '';
    this.needsInit = true;
    this.tableExists(this.tableName)
      .then(isCreated => {
        if (isCreated) {
          this.needsInit = false;
        }
        throw new Error(`MISSING_TABLE: The DynamoDB table ${this.tableName} does not exist.`);
      })
      .catch(error => {
        this.emit('error', error);
      });
  }

  /**
   * @inheritDoc
   */
  set(key: string, value: any, ttl: ?number): Promise<void> {
    try {
      this.checkIfInitializationIsNeeded();
    }
    catch (error) {
      return Promise.reject(error);
    }
    // Calculate the record expiration.
    const params: PutItemInput = {
      Items: {
        Key: { S: key },
        Value: { S: value },
      },
      TableName: this.tableName,
    };
    if (ttl) {
      params.Items.Expiration = { N: Date.now() + (ttl * 1000) };
    }
    return pify(this.dynamo.putItem)(params)
      .then(() => {});
  }

  /**
   * @inheritDoc
   */
  get(key: string): Promise<any> {
    try {
      this.checkIfInitializationIsNeeded();
    }
    catch (error) {
      return Promise.reject(error);
    }
    // Query for the data.
    const params: GetItemInput = {
      TableName: this.tableName,
      Key: { Key: { S: key } },
      ProjectionExpression: 'Expiration,Value',
    };
    return this.dynamo.getItem(params).promise()
      // Check if the record is expired.
      .then(this.deleteIfExpired.bind(this))
      .then((res: ?GetItemOutput) => res
        ? this.extractOutputProperty(res, 'Value')
        : res
      );
  }

  /**
   * @inheritDoc
   */
  delete(key: string): Promise<boolean> {
    try {
      this.checkIfInitializationIsNeeded();
    }
    catch (error) {
      return Promise.reject(error);
    }
    const params: DeleteItemInput = {
      Key: { Key: { S: key } },
      TableName: this.tableName,
    };
    return pify(this.dynamo.deleteItem)(params)
      .then(() => true);
  }


  /**
   * @inheritDoc
   */
  clear(): Promise<void> {
    try {
      this.checkIfInitializationIsNeeded();
    }
    catch (error) {
      return Promise.reject(error);
    }
    const params: ScanInput = {
      ExpressionAttributeNames: { K: 'Key' },
      ProjectionExpression: "#K",
      TableName: this.tableName,
    };
    return pify(this.dynamo.scan(params))
      .then((res: ScanOutput) => this.extractOutputProperties(res, 'Key'))
      .then((ids: Array<string>) => {
        const deleteRequests: Array<DeleteRequest> = ids.map(id => ({
          DeleteRequest: { Key: { Key: { S: id } } },
        }));
        // Batch writing only supports 25 deletions at a time in DynamoDB.
        const batches = this.chunkArray(deleteRequests, 25);
        return Promise.map(
          batches,
          (batch => {
            const requestItems: BatchWriteItemInput = {
              RequestItems: {
                [this.tableName]: batch,
              }
            };
            return pify(this.dynamo.batchWriteItem(requestItems))
          }),
          { concurrency: clearConcurrency }
        );
      })
      .then(() => {});
  }

  /**
   * Check if initialization is done.
   *
   * @throws {Error}
   *   When the key-value store is used before initialization.
   *
   * @protected
   */
  checkIfInitializationIsNeeded() {
    if (this.needsInit) {
      throw new Error('The table does not exist in DynamoDB');
    }
  }

  /**
   * Checks if a table with a given name exists.
   *
   * @param {string} tableName
   *   Then name of the table in DynamoDB.
   *
   * @return {Promise<boolean>}
   *   TRUE if it exists. FALSE otherwise.
   *
   * @protected
   */
  tableExists(tableName: string): Promise<boolean> {
    return pify(this.dynamo.describeTable)({
      TableName: tableName,
    })
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Extracts a property from the first record.
   *
   * @param {QueryOutput} output
   *   The output of a query operation.
   * @param {string} property
   *   The name of the property to extract.
   *
   * @returns {any}
   *   The value for that property.
   *
   * @protected
   */
  extractOutputProperty(output: GetItemOutput, property: string): any {
    return this.extractOutputProperties(output, property)[0];
  }

  /**
   * Extracts all properties from the record.
   *
   * @param {QueryOutput} output
   *   The output of a query operation.
   * @param {string} property
   *   The name of the property to extract.
   *
   * @returns {any}
   *   The value for that property.
   *
   * @protected
   */
  extractOutputProperties(output: GetItemOutput | ScanInput, property: string): Array<any> {
    return output.Items.map(item => DynamoDB.Converter.output(
      item[property]
    ));
  }

  /**
   * Schedules a deletion if the record is expired.
   *
   * @param {GetItemOutput} res
   *   The result of the query.
   * @param {string} key
   *   The key of the record to delete.
   *
   * @returns {GetItemOutput|undefined}
   *   The same output if not expired. Undefined otherwise.
   *
   * @protected
   */
  deleteIfExpired(res: GetItemOutput, key: string): ?GetItemOutput {
    const exp = parseInt(this.extractOutputProperty(res, 'Expiration'), 10);
    if (exp > Date.now()) {
      // Schedule the item deletion when the record is expired.
      process.nextTick(() => this.delete(key));
      return undefined;
    }
    return res;
  }

  /**
   * Chunk an array into smaller arrays.
   *
   * @param {Array} array
   *   The array to chunk.
   * @param {number} chunkSize
   *   The number of items per chunk.
   *
   * @returns {Array[]}
   *   The array of chunks.
   *
   * @protected
   */
  chunkArray(array: Array<*>, chunkSize: number): Array<Array<*>> {
    let i;
    let j;
    const output = [];
    for (i = 0, j = array.length; i<j; i += chunkSize) {
      output.push(array.slice(i, i + chunkSize));
    }
    return output;
  }
}

module.exports = KeyvDynamoDb;
