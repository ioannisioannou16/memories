'use strict';

const AWS = require("aws-sdk")
const utils = require("../utils");

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

module.exports.handler = async (event) => {
  const { memoryId, imageId } = event.pathParameters;
  const userId = utils.getUserId(event);

  await docClient.update({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    UpdateExpression: "DELETE images :imageId",
    ExpressionAttributeValues: {
      ':userId': userId,
      ":imageId": docClient.createSet([imageId])
    },
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      memoryId,
      imageId
    }),
  };
};
