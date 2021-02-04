'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const createError = require('http-errors')
const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const memoriesTable = process.env.MEMORIES_TABLE_NAME
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)

const getMemorySchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        memoryId: {
          type: "string",
          format: "uuid"
        },
      },
      required: ["memoryId"],
    },
  },
  required: ['pathParameters']
}

const handler = middy(async (event) => {
  const memoryId = event.pathParameters.memoryId
  const userId = utils.getUserId(event)

  const memory = (await docClient.get({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()).Item

  if (!memory) {
    throw new createError.NotFound("Memory does not exist")
  }

  const images = await Promise.all((memory.images ? memory.images.values : []).map(async (imageId) => ({
    imageId,
    imageUrl: await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: `${userId}/${imageId}`,
      Expires: urlExpiration
    })
  })))
  const memoryWithImageUrls = {
    ...memory,
    images
  }

  return {
    statusCode: 200,
    body: JSON.stringify(memoryWithImageUrls),
  }
})

handler
  .use(cors())
  .use(validator({ inputSchema: getMemorySchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
