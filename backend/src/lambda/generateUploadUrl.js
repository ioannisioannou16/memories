'use strict';

const AWS = require("aws-sdk")
const { v4: uuid } = require("uuid")
const utils = require('../utils')

const s3 = new AWS.S3({ signatureVersion: 'v4' })
const docClient = new AWS.DynamoDB.DocumentClient()
const photoTable = process.env.PHOTO_TABLE_NAME
const albumTable = process.env.ALBUM_TABLE_NAME;
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.PUT_SIGNED_URL_EXPIRATION)

module.exports.handler = async (event) => {
  const { albumId, fileType } = JSON.parse(event.body);
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

  const imageId = uuid();
  const key = `${userId}/${imageId}`;
  const uploadUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: urlExpiration,
    ContentType: fileType
  })

  const photoItem = {
    albumId,
    createdAt: (new Date()).toISOString(),
    imageKey: key
  }
  await docClient.put({
    TableName: photoTable,
    Item: photoItem
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl,
      photoItem
    }),
  };
};
