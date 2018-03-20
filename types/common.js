import type { DynamoClientOptions } from './aws';

export type KeyvDynamoDbOptions = {
  tableName: string,
  clientOptions: DynamoClientOptions
};
