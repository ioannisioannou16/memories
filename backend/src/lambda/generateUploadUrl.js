'use strict';

const AWS = require("aws-sdk")
const utils = require("../utils");
const { v4: uuid } = require("uuid")

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const memoriesTable = process.env.MEMORIES_TABLE_NAME
const getUrlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)
const putUrlExpiration = parseInt(process.env.PUT_SIGNED_URL_EXPIRATION)

module.exports.handler = async (event) => {
  const { memoryId } = JSON.parse(event.body);
  const userId = utils.getUserId(event);
  const imageId = uuid();

  await docClient.update({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId AND (attribute_not_exists(images) OR size (images) < :maxImages)",
    UpdateExpression: "ADD images :imageId",
    ExpressionAttributeValues: {
      ':userId': userId,
      ":imageId": docClient.createSet([imageId]),
      ":maxImages": 10
    },
  }).promise()

  const [imageUploadUrl, imageUrl] = await Promise.all([
    s3.getSignedUrlPromise('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: putUrlExpiration,
    }),
    s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: getUrlExpiration,
    })
  ]);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      imageUploadUrl,
      imageUrl,
      imageId
    }),
  };
};
