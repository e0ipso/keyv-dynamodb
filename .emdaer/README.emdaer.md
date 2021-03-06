<h1 align="center">
<!--emdaer-p
- '@emdaer/plugin-value-from-package'
- value: name
-->
    </br>
    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/DynamoDB.png" alt="Keyv DynamoDB logo" title="Keyv DynamoDB logo" width="100">
</h1>
<p align="center">
<!--emdaer-p
  - '@emdaer/plugin-value-from-package'
  - value: description
-->
</p>
<hr />

<!--emdaer-t
  - '@emdaer/transform-table-of-contents'
--> · <!--emdaer-p
 - '@emdaer/plugin-shields'
 - shields:
     - alt: 'Travis'
       image: 'travis/e0ipso/keyv-dynamodb.svg'
       link: 'https://travis-ci.org/e0ipso/keyv-dynamodb/'
       style: 'flat-square'
     - alt: 'Coverage'
       image: 'coveralls/github/e0ipso/keyv-dynamodb.svg'
       link: 'https://coveralls.io/github/e0ipso/keyv-dynamodb/'
       style: 'flat-square'
     - alt: 'Documented with emdaer'
       image: 'badge/📓-documented%20with%20emdaer-F06632.svg'
       link: 'https://github.com/emdaer/emdaer'
       style: 'flat-square'
-->

## Install
1. `yarn add @keyv/dynamodb`
2. Create the DynamoDB table using the `aws` CLI tool. Alternatively you can use
the web dashboard to create the table, just make sure to create the expected
fields. It is important to keep the field names as provided in the example. You
will need to provision the [DynamoDB capacities](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html)
based on your expected usage. Execute in a terminal:
```
# 1. Create the DynamoDb table.
# Add profile or key/secret information if necessary.
aws dynamodb create-table \
    --table-name KeyvStore \
    --attribute-definitions \
        AttributeName=Cid,AttributeType=S \
    --key-schema AttributeName=Cid,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
# 2. Enable the TTL attribute. You may need to wait for the table to finish the
# creation process.
# Add profile or key/secret information if necessary.
aws dynamodb update-time-to-live \
    --table-name KeyvStore \
    --time-to-live-specification Enabled=true,AttributeName=Expiration
```

## Why?
This project is interesting when used with the [got](npmjs.com/package/got) HTTP
client (or directly using
[cacheable-request](npmjs.com/package/cacheable-request)) inside of a Serverless
project. Traditional cache solutions like ElastiCache with Redis will force you
to deploy inside of a VPC. This has negative implications with regards to
performance (via Lambda cold-starts) and scalability (via limited subnet size).
This will allow you to have an application cache backend that doesn't require a
VPC, since DynamoDB connections from Lambda do not require to deploy into a VPC.

You can also use this project as a stand-alone arbitrary cache back-end, without
[got](npmjs.com/package/got) or
[cacheable-request](npmjs.com/package/cacheable-request)).

## Usage
```js
const KeyvDynamoDb = require('@keyv/dynamodb');

const keyvDynamoDb = new KeyvDynamoDb({
  tableName: 'KeyvStore',
  clientOptions: {
    // Any options here will be passed to the DynamoDB client.
    region: 'eu-central-1',
  }
});
keyvDynamoDb.on('error', handleConnectionError);
```

Or you can manually create a storage adapter instance and pass it to Keyv:

```js
const Keyv = require('keyv');
const KeyvDynamoDb = require('@keyv/dynamodb');
 
const keyvDynamoDb = new KeyvDynamoDb({
  tableName: 'KeyvStore',
  clientOptions: {
    // Any options here will be passed to the DynamoDB client.
    region: 'eu-central-1',
  }
});
const keyv = new Keyv({ store: keyvDynamoDb });
```

## Contributors
<!--emdaer-p
  - '@emdaer/plugin-contributors-details-github'
-->

## License
<!--emdaer-p
  - '@emdaer/plugin-license-reference'
-->

<!--emdaer-t
  - '@emdaer/transform-prettier'
  - options:
      proseWrap: preserve
      singleQuote: true
      trailingComma: es5
-->
