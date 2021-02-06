'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const { v4: uuid } = require("uuid")
const utils = require('../utils')
const memoriesDao = require('../dao/memories')

const handler = middy(async (event) => {

  const memory = {
    memoryId: uuid(),
    userId: utils.getUserId(event),
    createdAt: (new Date()).toISOString(),
  }

  await memoriesDao.createMemory(memory)

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
