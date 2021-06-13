const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const uuid = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());

const CUSTOMERS_TABLE = process.env.CUSTOMERS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;

if (IS_OFFLINE === 'true') {

  AWS.config.update({
    region: "eu-west-1",
    endpoint: "http://localhost:8080",
    accessKeyId: "123456",
    secretAccessKey: "123456"
  });

  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  console.log(dynamoDb);
}else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(express.json());

// Get all Customers
app.get("/customers", async function (req, res) {

  const params = {
    TableName: CUSTOMERS_TABLE
  }
  
  try {
    const response = await dynamoDb.scan(params).promise();
    res.json(response.Items || []);
  } catch (error) {
    res
    .status(404)
    .json({ error: 'Could not find any customers' });
  }
  
});

// Get customer by customerId
app.get("/customers/:customerId", async function (req, res) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: {
      customerId: req.params.customerId,
    },
  };

  try {
    const { Item } = await dynamoDb.get(params).promise();
    if (Item) {
      const { customerId, firstName, lastName, observations } = Item;
      res.json({ customerId, firstName, lastName, observations });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find customer with provided "customerId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive customer" });
  }
});

// Create customer
app.post("/customers", async function (req, res) {
  const { firstName, lastName, observations } = req.body;
  
  if (typeof firstName !== "string" || typeof lastName !== "string") {
    res.status(400).json({ error: '"firstName and lastName" must be a string' });
  }

  const customerId = uuid.v4();

  const params = {
    TableName: CUSTOMERS_TABLE,
    Item: {
      customerId: customerId,
      firstName: firstName,
      lastName: lastName,
      observations: observations || ''
    },
  };

  try {
    await dynamoDb.put(params).promise();
    res.json({ customerId, firstName, lastName, observations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create customer" });
  }
});

// Delete customer
app.delete("/customers/:customerId", async function (req, res) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: {
      customerId: req.params.customerId,
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    res.status(204).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not delete customer" });
  }
})

// Update Customer
app.put("/customers/:customerId", async function(req, res) {
  const fields = req.body;

  if (typeof req.params.customerId === 'undefined') {
    return res.status(404).json({error: "customerId could not be empty"});
  }

  const generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: 'set',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp
  }

  const dinamicallyExpression = generateUpdateQuery(fields);

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: {
      "customerId": req.params.customerId,
    },
    ReturnValues: "ALL_NEW",
    ...dinamicallyExpression
  }

  try {
    const { Attributes: updatedCustomer } = await dynamoDb.update(params).promise();
    return res.status(201).json(updatedCustomer);
  } catch (error) {
    console.log(error);
    return res.status(404).json({error: "Could not update Customer."})
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
