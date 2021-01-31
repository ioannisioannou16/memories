'use strict';

const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const albumTable = process.env.ALBUM_TABLE_NAME
const photoTable = process.env.PHOTO_TABLE_NAME

module.exports.handler = async (event) => {
  const albumId = event.pathParameters.albumId;
  const userId = utils.getUserId(event);

  await docClient.delete({
    TableName: albumTable,
    Key: {
      "albumId": albumId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()

  const photoItems = (await docClient.query({
    TableName: photoTable,
    KeyConditionExpression: 'albumId = :albumId',
    ExpressionAttributeValues: {
      ':albumId': albumId
    }
  }).promise()).Items;

  if (photoItems.length) {
    await docClient.batchWrite({
      RequestItems: {
        [photoTable]: photoItems.map(photoItem => ({
          DeleteRequest: {
            Key: {
              "albumId": photoItem.albumId,
              "createdAt": photoItem.createdAt
            }
          }
        }))
      }
    }).promise()
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({}),
  };
};
