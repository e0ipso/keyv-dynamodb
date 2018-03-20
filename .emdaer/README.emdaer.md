<h1 align="center">
<!--emdaer-p
- '@emdaer/plugin-value-from-package'
- value: name
-->
    </br>
    <img src="https://commons.wikimedia.org/wiki/File:DynamoDB.png#/media/File:DynamoDB.png" alt="Keyv DynamoDB logo" title="Keyv DynamoDB logo" width="100">
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
-->

## Install
1. `yarn add @keyv/dynamodb`
2. Create the DynamoDB table using the `aws` CLI tool. Alternatively you can use
the web dashboard to create the table, just make sure to create the expected
fields. It is important to keep the field names as provided in the example. You
will need to provision the [DynamoDB capacities](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html)
based on your expected usage. Execute in a terminal:
```
# Add profile or key/secret information if necessary
aws dynamodb create-table \
    --table-name KeyvStore \
    --attribute-definitions \
        AttributeName=Key,AttributeType=S \
        AttributeName=Value,AttributeType=S \
    --key-schema AttributeName=Key,KeyType=HASH AttributeName=Value,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
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
const Keyv = require('keyv');
 
const keyv = new Keyv('redis://user:pass@localhost:6379');
keyv.on('error', handleConnectionError);
```

Any valid redis.createClient() options will be passed directly through.

e.g:
```js
const keyv = new Keyv('redis://user:pass@localhost:6379', { disable_resubscribing: true });
```

Or you can manually create a storage adapter instance and pass it to Keyv:

```js
const Keyv = require('keyv');
const KeyvRedis = require('@keyv/redis');
 
const redis = new KeyvRedis('redis://user:pass@localhost:6379');
const keyv = new Keyv({ store: redis });
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
