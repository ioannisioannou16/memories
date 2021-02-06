'use strict'

const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const AWS = require("aws-sdk")
const utils = require('../utils')
const memoriesDao = require('../dao/memories')

const s3 = new AWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const urlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)

const handler = middy(async (event) => {

  const userId = utils.getUserId(event)

  const memories = await memoriesDao.getMemories(userId);

  const memoriesWithImageUrls = await Promise.all(memories.map(async (memory) => {
    const images = await Promise.all((memory.images ? memory.images.values : []).map(async (imageId) => ({
      imageId,
      imageUrl: await s3.getSignedUrlPromise('getObject', {
          Bucket: bucketName,
          Key: `${userId}/${imageId}`,
          Expires: urlExpiration
        })
    })))
    return {
      ...memory,
      images
    }
  }))

  return {
    statusCode: 200,
    body: JSON.stringify(memoriesWithImageUrls),
  }
})

handler
  .use(cors())
  .use(httpErrorHandler())

module.exports = {
  handler
}
