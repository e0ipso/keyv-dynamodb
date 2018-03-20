const KeyvDynamoDb = require('../src/index');

describe('The KeyvDynamoDb class', () => {
  test('the constructor succeeds', () => {
    expect.assertions(1);
    const stub = jest.spyOn(KeyvDynamoDb.prototype, 'tableExists').mockImplementation(() =>
      Promise.resolve(true));
    const sut = new KeyvDynamoDb({});
    sut.on('isInitialized', () => {
      expect(sut.needsInit).toBe(false);
    });
    stub.mockRestore();
  });
  test('the constructor errors', () => {
    expect.assertions(2);
    const stub = jest.spyOn(KeyvDynamoDb.prototype, 'tableExists').mockImplementation(() =>
      Promise.resolve(false));
    const sut = new KeyvDynamoDb({});
    sut.on('error', err => {
      expect(sut.needsInit).toBe(true);
      expect(err.message).toBe('MISSING_TABLE: The DynamoDB table  does not exist.');
    });
    stub.mockRestore();
  });
  describe('the methods', () => {
    let sut;

    beforeAll(() => {
      const stub = jest.spyOn(KeyvDynamoDb.prototype, 'tableExists').mockImplementation(() =>
        Promise.resolve(true));
      sut = new KeyvDynamoDb({ tableName: 'the-table' });
      stub.mockRestore();
    });

    afterAll(() => {
      jest.mockRestoreAll();
    });

    describe('the get method', () => {
      test('unexpired items', () => {
        expect.assertions(1);
        jest.spyOn(sut.dynamo, 'getItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve({
              Item: {
                CacheData: { S: 'the-data' },
                Expiration: { N: parseInt((Date.now() / 1000) + 8000, 10) },
              }
            });
          },
        }));
        return sut.get('anything')
          .then(value => {
            expect(value).toBe('the-data')
          });
      });
      test('unexpired missing items', () => {
        expect.assertions(1);
        jest.spyOn(sut.dynamo, 'getItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve({
              Item: {}
            });
          },
        }));
        return sut.get('anything')
          .then(value => {
            expect(value).toBeUndefined()
          });
      });
      test('expired items', () => {
        expect.assertions(1);
        jest.spyOn(sut.dynamo, 'getItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve({
              Item: {
                CacheData: { S: 'the-data' },
                Expiration: { N: parseInt((Date.now() / 1000) - 8000, 10) },
              }
            });
          },
        }));
        jest.spyOn(sut, 'delete');
        return sut.get('anything')
          .then(value => {
            expect(value).toBeUndefined();
          });
      });
    });

    describe('the set method', () => {
      test('without TTL', () => {
        expect.assertions(2);
        jest.spyOn(sut.dynamo, 'putItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve();
          }
        }));
        return sut.set('anything', 'the-val')
          .then(value => {
            expect(value).toBeUndefined();
            expect(sut.dynamo.putItem).toHaveBeenCalled();
          })
      });
      test('with a TTL', () => {
        expect.assertions(3);
        jest.spyOn(sut.dynamo, 'putItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve();
          }
        }));
        return sut.set('anything', 'the-val', 123)
          .then(value => {
            expect(value).toBeUndefined();
            expect(sut.dynamo.putItem).toHaveBeenCalled();
            expect(sut.dynamo.putItem.mock.calls[1][0].Item.Expiration.N).not.toBeUndefined();
          });
      });
    });

    describe('the delete method', () => {
      test('success', () => {
        expect.assertions(3);
        jest.spyOn(sut.dynamo, 'deleteItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve();
          }
        }));
        return sut.delete('anything')
          .then(value => {
            expect(value).toBeUndefined();
            expect(sut.dynamo.deleteItem).toHaveBeenCalled();
            expect(sut.dynamo.deleteItem.mock.calls[0][0].Key.Cid.S).toBe('anything');
          });
      });
    });

    describe('the clear method', () => {
      test('success', () => {
        expect.assertions(5);
        jest.spyOn(sut.dynamo, 'scan').mockImplementation(() => ({
          promise() {
            return Promise.resolve({
              Items: [
                { Cid: { S: 'first' } },
                { Cid: { S: 'second' } },
              ]
            });
          }
        }));
        jest.spyOn(sut.dynamo, 'batchWriteItem').mockImplementation(() => ({
          promise() {
            return Promise.resolve();
          }
        }));
        return sut.clear()
          .then(value => {
            expect(value).toBeUndefined();
            expect(sut.dynamo.scan).toHaveBeenCalled();
            expect(sut.dynamo.batchWriteItem).toHaveBeenCalled();
            expect(sut.dynamo.batchWriteItem.mock.calls[0][0].RequestItems['the-table'][0].DeleteRequest.Key.Cid.S).toBe('first');
            expect(sut.dynamo.batchWriteItem.mock.calls[0][0].RequestItems['the-table'][1].DeleteRequest.Key.Cid.S).toBe('second');
          });
      });
    });

    describe('the tableExists method', () => {
      test('success', () => {
        expect.assertions(2);

        const stub = jest.spyOn(sut.dynamo, 'describeTable');
        stub.mockImplementationOnce(() => ({
          promise() {
            return Promise.resolve();
          }
        }));
        stub.mockImplementationOnce(() => ({
          promise() {
            return Promise.reject();
          }
        }));
        return sut.tableExists('the-table')
          .then(value => {
            expect(value).toBe(true);
            return sut.tableExists('the-table');
          })
          .then(value => {
            expect(value).toBe(false);
          });
      });
    });
  });

  test('the uninitialized methods', () => {
    expect.assertions(6);
    const stub = jest.spyOn(KeyvDynamoDb.prototype, 'tableExists').mockImplementation(() =>
      Promise.resolve(false));
    const sut = new KeyvDynamoDb({ tableName: 'the-table' });
    sut.on('error', err => {
      expect(sut.needsInit).toBe(true);
      expect(err.message).toBe('MISSING_TABLE: The DynamoDB table the-table does not exist.');
    });
    stub.mockRestore();
    return Promise.all(['get', 'set', 'delete', 'clear']
      .map(method => sut[method]().catch(error => {
        expect(error.message).toBe('The table does not exist in DynamoDB');
      })));
  });
});
