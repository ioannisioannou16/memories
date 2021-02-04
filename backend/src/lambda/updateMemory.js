'use strict';

const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

module.exports.handler = async (event) => {
  const memoryId = event.pathParameters.memoryId;
  const { title, description } = JSON.parse(event.body)
  const userId = utils.getUserId(event);

  const titleOrEmpty = title || "";
  const descriptionOrEmpty = description || "";

  await docClient.update({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    UpdateExpression: "set title = :title, description = :description ",
    ExpressionAttributeValues: {
      ':userId': userId,
      ":title": titleOrEmpty,
      ":description": descriptionOrEmpty,
    },
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      memoryId,
      title,
      description
    }),
  };
};
