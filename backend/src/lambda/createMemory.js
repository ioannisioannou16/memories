'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const utils = require('../utils')
const memoriesService = require('../services/memoriesService')

const handler = middy(async (event) => {
  const userId = utils.getUserId(event)
  const result = await memoriesService.createMemory(userId)
  return {
    statusCode: 201,
    body: JSON.stringify(result),
  }
})

handler
  .use(httpErrorHandler())
  .use(cors())

module.exports = {
  handler
}
