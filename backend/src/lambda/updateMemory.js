'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require("@middy/validator")
const createError = require('http-errors')
const utils = require('../utils')
const memoriesDao = require('../dao/memories')
const inputSchema = require("../schema/updateMemory.json")

const handler = middy(async (event) => {
  const memoryId = event.pathParameters.memoryId
  const { title = "", description = "" } = event.body
  const userId = utils.getUserId(event)

  try {
    await memoriesDao.updateMemory(userId, memoryId, { title, description })
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
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = {
  handler
}
