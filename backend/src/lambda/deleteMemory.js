'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const utils = require('../utils')
const memoriesService = require('../services/memoriesService')
const inputSchema = require("../schema/deleteMemory.json")

const handler = middy(async (event) => {
  const userId = utils.getUserId(event)
  const memoryId = event.pathParameters.memoryId
  const result = await memoriesService.deleteMemory(userId, memoryId)
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
})

handler
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(cors())

module.exports = {
  handler
}
