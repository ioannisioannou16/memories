'use strict';

const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

module.exports.handler = async (event) => {
  const memoryId = event.pathParameters.memoryId;
  const userId = utils.getUserId(event);

  await docClient.delete({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      memoryId
    }),
  };
};
