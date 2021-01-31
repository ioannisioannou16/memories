'use strict';

const { decode } = require('jsonwebtoken')

const getUserId = (event) => {
  const token = extractTokenFromEvent(event)
  const decodedJwt = decode(token)
  return decodedJwt.sub
}

const extractTokenFromEvent = (event) => {
  const authHeader = event.headers.authorization
  return authHeader.split(" ")[1]
}

module.exports = {
  getUserId,
  extractTokenFromEvent
}
