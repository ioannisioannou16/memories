'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const AWS = require("aws-sdk")
const { v4: uuid } = require("uuid")
const utils = require('../utils')

const docClient = new AWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME

const handler = middy(async (event) => {

  const memory = {
    memoryId: uuid(),
    userId: utils.getUserId(event),
    createdAt: (new Date()).toISOString(),
  }

  await docClient.put({
    TableName: memoriesTable,
    Item: memory
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(memory),
  }
})

handler
  .use(cors())
  .use(httpErrorHandler())

module.exports = {
  handler
}
