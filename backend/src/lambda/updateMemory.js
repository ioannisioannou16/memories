'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const createError = require('http-errors')
const AWS = require("aws-sdk")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

const updateMemorySchema = {
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
    body: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
      },
    },
  },
  required: ['pathParameters', 'body']
}

const handler = middy(async (event) => {
  const memoryId = event.pathParameters.memoryId
  const { title = "", description = "" } = event.body
  const userId = utils.getUserId(event)

  try {
    await docClient.update({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "attribute_exists(memoryId) AND userId = :userId",
      UpdateExpression: "set title = :title, description = :description ",
      ExpressionAttributeValues: {
        ':userId': userId,
        ":title": title,
        ":description": title,
      },
    }).promise()
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      throw new createError.BadRequest("Unable to update memory")
    }
    throw err
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      memoryId,
      title,
      description
    })
  }
})

handler
  .use(cors())
  .use(httpJsonBodyParser())
  .use(validator({ inputSchema: updateMemorySchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
