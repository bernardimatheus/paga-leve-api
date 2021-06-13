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

After successful deployment, you can create a new customer by calling the corresponding endpoint:

```bash
curl --request POST 'https://v3b2slwkhg.execute-api.us-east-1.amazonaws.com/dev/customers' --header 'Content-Type: application/json' --data-raw '{"firstName": "John", "lastName": "SomeName", "observations": "SomeObs"}'
```

Which should result in the following response:

```bash
{"firstName":"someName","lastName":"SomeName","observations":"SomeObs"}
```

You can later retrieve the customer by `customerId` by calling the following endpoint:

```bash
curl https://v3b2slwkhg.execute-api.us-east-1.amazonaws.com/dev/customerId
```

Which should result in the following response:

```bash
{"firstName":"someName","lastName":"SomeName","observations":"SomeObs"}
```

If you try to retrieve customer that does not exist, you should receive the following response:

```bash
{"error":"Could not find customer with provided \"customerId\""}
```

You can delete customer with the following endpoint:

```bash
curl -X DELETE https://v3b2slwkhg.execute-api.us-east-1.amazonaws.com/dev/customerId
```

There is no response for this call.

Finally, to update customer, do the following request:

```bash
curl -X PUT -d 'firstName=SomeName&lastName=someLastName&observations=someObservations'  https://v3b2slwkhg.execute-api.us-east-1.amazonaws.com/dev/customerId
```

Response is the customer updated object

### Local development

It is also possible to emulate DynamodB, API Gateway and Lambda locally by using `serverless-dynamodb-local` and `serverless-offline` plugins. In order to do that, execute the following commands:

```bash
serverless plugin install -n serverless-dynamodb-local
serverless plugin install -n serverless-offline
```

After that, running the following command with start both local API Gateway emulator as well as local instance of emulated DynamoDB:

```bash
serverless offline start
```
