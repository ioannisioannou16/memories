'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const AWS = require("aws-sdk")
const utils = require("../utils")
const inputSchema = require("../schema/deleteMemoryImage.json")

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

const handler = middy(async (event) => {
  const { memoryId, imageId } = event.pathParameters
  const userId = utils.getUserId(event)

  try {
    await docClient.update({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "userId = :userId",
      UpdateExpression: "DELETE images :imageId",
      ExpressionAttributeValues: {
        ':userId': userId,
        ":imageId": docClient.createSet([imageId])
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
      memoryId,
      imageId
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
