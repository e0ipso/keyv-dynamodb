// @flow

export type DynamoClientOptions = {
  endpoint?: string,
  params?: {
    [string]: any,
  },
  apiVersion?: "2011-12-05" | "2012-08-10" | "latest" | string,
  computeChecksums?: boolean,
  convertResponseTypes?: boolean,
  correctClockSkew?: boolean,
  customUserAgent?: string,
  accessKeyId?: string,
  secretAccessKey?: string,
  sessionToken?: string,
  maxRedirects?: number,
  maxRetries?: number,
  region?: string,
  s3BucketEndpoint?: boolean,
  s3DisableBodySigning?: boolean,
  s3ForcePathStyle?: boolean,
  signatureCache?: boolean,
  signatureVersion?: "v2" | "v3" | "v4" | string,
  sslEnabled?: boolean,
  systemClockOffset?: number,
  useAccelerateEndpoint?: boolean,
  dynamoDbCrc32?: boolean,
};

export type ApiGatewayEvent = {
  body: ?string;
  headers: { [name: string]: string };
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: ?{ [name: string]: string };
  queryStringParameters: ?{ [name: string]: string };
  stageVariables: ?{ [name: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    httpMethod: string;
    identity: {
      accessKey: ?string;
      accountId: ?string;
      apiKey: ?string;
      caller: ?string;
      cognitoAuthenticationProvider: ?string;
      cognitoAuthenticationType: ?string;
      cognitoIdentityId: ?string;
      cognitoIdentityPoolId: ?string;
      sourceIp: string;
      user: ?string;
      userAgent: ?string;
      userArn: ?string;
    },
    stage: string;
    requestId: string;
    resourceId: string;
    resourcePath: string;
  };
  resource: string;
}

export type LambdaContext = {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: number;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
}

export type LambdaCallback = (error?: Error, result?: any) => void;
