'use strict';

const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const memoriesTable = process.env.MEMORIES_TABLE_NAME
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)

module.exports.handler = async (event) => {
  const memoryId = event.pathParameters.memoryId;
  const userId = utils.getUserId(event);

  const memory = (await docClient.get({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()).Item;

  const images = await Promise.all((memory.images ? memory.images.values : []).map(async (imageId) => ({
    imageId,
    imageUrl: await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration
    })
  })))
  const memoryWithImageUrls = {
    ...memory,
    images
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(memoryWithImageUrls),
  };
};
