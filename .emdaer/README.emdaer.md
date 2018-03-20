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
* `yarn add @keyv/dynamodb`

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
