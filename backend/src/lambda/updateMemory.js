'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const utils = require('../utils')
const memoriesService = require('../services/memoriesService')
const inputSchema = require("../schema/updateMemory.json")

const handler = middy(async (event) => {
  const userId = utils.getUserId(event)
  const memoryId = event.pathParameters.memoryId
  const { title = "", description = "" } = event.body
  const result = await memoriesService.updateMemory(userId, { memoryId, title, description })
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
})

handler
  .use(httpJsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(cors())

module.exports = {
  handler
}
