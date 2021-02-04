'use strict';

const AWS = require("aws-sdk")
const { v4: uuid } = require("uuid")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

module.exports.handler = async (event) => {

  const memory = {
    memoryId: uuid(),
    userId: utils.getUserId(event),
    createdAt: (new Date()).toISOString(),
  }

  await docClient.put({
    TableName: memoriesTable,
    Item: memory
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(memory),
  };
};
