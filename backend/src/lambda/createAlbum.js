'use strict';

const AWS = require("aws-sdk")
const { v4: uuid } = require("uuid")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const albumTable = process.env.ALBUM_TABLE_NAME

module.exports.handler = async (event) => {

  const album = {
    albumId: uuid(),
    userId: utils.getUserId(event),
    createdAt: (new Date()).toISOString()
  }

  await docClient.put({
    TableName: albumTable,
    Item: album
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(album),
  };
};
