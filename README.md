# Serverless Framework Node Express API on AWS

This repository was made with Serverless Template, following the documentation.

## Usage

### Deployment

This example is made to work with the Serverless Framework dashboard, which includes advanced features such as CI/CD, monitoring, metrics, etc.

In order to deploy with dashboard, you need to first login with:

```
serverless login
```

install dependencies with:

```
npm install
```

and then perform deployment with:

```
serverless deploy
```

### Invocation

After successful deployment, you can create a new user by calling the corresponding endpoint:

```bash
curl --request POST 'https://xxxxxx.execute-api.us-east-1.amazonaws.com/dev/customers' --header 'Content-Type: application/json' --data-raw '{"firstName": "John", "lastName": "SomeName", "observations": "SomeObs"}'
```

Which should result in the following response:

```bash
{"firstName":"someName","lastName":"SomeName","observations":"SomeObs"}
```

You can later retrieve the customer by `customerId` by calling the following endpoint:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/users/customerId
```

Which should result in the following response:

```bash
{"firstName":"someName","lastName":"SomeName","observations":"SomeObs"}
```

If you try to retrieve user that does not exist, you should receive the following response:

```bash
{"error":"Could not find customer with provided \"customerId\""}
```

### Local development

It is also possible to emulate DynamodB, API Gateway and Lambda locally by using `serverless-dynamodb-local` and `serverless-offline` plugins. In order to do that, execute the following commands:

```bash
serverless plugin install -n serverless-dynamodb-local
serverless plugin install -n serverless-offline
```

It will add both plugins to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`. Make sure that `serverless-offline` is listed as last plugin in `plugins` section:

```
plugins:
  - serverless-dynamodb-local
  - serverless-offline
```

You should also add the following config to `custom` section in `serverless.yml`:

```
custom:
  (...)
  dynamodb:
    start:
      migrate: true
    stages:
      - dev
```

Additionally, we need to reconfigure `AWS.DynamoDB.DocumentClient` to connect to our local instance of DynamoDB. We can take advantage of `IS_OFFLINE` environment variable set by `serverless-offline` plugin and replace:

```javascript
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
```

with the following:

```javascript
const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = "localhost";
  dynamoDbClientParams.endpoint = "http://localhost:8000";
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);
```

After that, running the following command with start both local API Gateway emulator as well as local instance of emulated DynamoDB:

```bash
serverless offline start
```
