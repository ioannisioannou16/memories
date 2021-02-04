'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

const deleteMemorySchema = {
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

  try {
    await docClient.delete({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()
  } catch (err) {
    if (err.code !== 'ConditionalCheckFailedException') {
      throw err
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      memoryId
    })
  }
})

handler
  .use(cors())
  .use(validator({ inputSchema: deleteMemorySchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
