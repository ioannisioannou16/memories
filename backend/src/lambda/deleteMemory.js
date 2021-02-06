'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const AWS = require("aws-sdk")
const utils = require('../utils')
const inputSchema = require("../schema/deleteMemory.json")

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

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
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
