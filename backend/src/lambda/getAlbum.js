'use strict';

const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const albumTable = process.env.ALBUM_TABLE_NAME;
const photoTable = process.env.PHOTO_TABLE_NAME
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)

module.exports.handler = async (event) => {

  const albumId = event.pathParameters.albumId;
  const userId = utils.getUserId(event);

  const album = (await docClient.get({
    TableName: albumTable,
    Key: {
      "albumId": albumId
    }
  }).promise()).Item;
  if (!album) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({}),
    };
  }
  if (album.userId !== userId) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({}),
    };
  }

  const photoResult = await docClient.query({
    TableName: photoTable,
    KeyConditionExpression: 'albumId = :albumId',
    ExpressionAttributeValues: {
      ':albumId': albumId
    },
  }).promise()

  const photos = await Promise.all(photoResult.Items.map(({ imageKey }) => {
    return s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageKey,
      Expires: urlExpiration
    });
  }))

  const result = {
    ...album,
    photos
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result),
  };
};
