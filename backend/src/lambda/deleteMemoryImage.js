'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const utils = require("../utils")
const memoriesService = require('../services/memoriesService')
const inputSchema = require("../schema/deleteMemoryImage.json")

const handler = middy(async (event) => {
  const userId = utils.getUserId(event)
  const { memoryId, imageId } = event.pathParameters
  const result = await memoriesService.deleteMemoryImage(userId, memoryId, imageId)
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
})

handler
  .use(cors())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
