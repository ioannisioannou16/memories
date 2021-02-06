'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const utils = require("../utils")
const memoriesDao = require('../dao/memories')
const inputSchema = require("../schema/deleteMemoryImage.json")

const handler = middy(async (event) => {
  const { memoryId, imageId } = event.pathParameters
  const userId = utils.getUserId(event)

  try {
    await memoriesDao.deleteMemoryImage(userId, memoryId, imageId)
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
