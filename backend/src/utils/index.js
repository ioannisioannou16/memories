'use strict'

const { decode } = require('jsonwebtoken')
const winston = require('winston')

const getUserId = (event) => {
  const token = extractTokenFromEvent(event)
  const decodedJwt = decode(token)
  return decodedJwt.sub
}

const extractTokenFromEvent = (event) => {
  const authHeader = event.headers.Authorization
  return authHeader.split(" ")[1]
}

const createLogger = (name) => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { name },
    transports: [
      new winston.transports.Console()
    ]
  })
}

module.exports = {
  getUserId,
  extractTokenFromEvent,
  createLogger
}
