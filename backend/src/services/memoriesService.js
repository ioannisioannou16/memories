const memoriesDao = require('../dao/memoriesDao')
const AWS = require("aws-sdk")
const AWSXRay = require("aws-xray-sdk")
const createError = require('http-errors')
const { v4: uuid } = require('uuid')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const getUrlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)
const postUrlExpiration = parseInt(process.env.POST_SIGNED_URL_EXPIRATION)

const createMemory = async (userId) => {
  const memory = {
    memoryId: uuid(),
    userId,
    createdAt: (new Date()).toISOString(),
  }
  await memoriesDao.createMemory(memory)
  return memory
}

const createImageAndGeneratePresignedUrls = async (userId, memoryId) => {
  const imageId = uuid()
  await memoriesDao.addMemoryImage(userId, memoryId, imageId)
  const imageKey = `${userId}/${imageId}`
  const [imageUploadData, imageUrl] = await Promise.all([
    s3.createPresignedPost({
      Bucket: bucketName,
      Fields: {
        key: imageKey,
      },
      Expires: postUrlExpiration,
      Conditions: [
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", 0, 10485760],
      ]
    }),
    s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageKey,
      Expires: getUrlExpiration,
    })
  ])
  return {
    imageId,
    imageUploadData,
    imageUrl
  }
}

const addMemoryImageSignedUrls = async (userId, memory) => {
  const images = await Promise.all(memory.images.map(async (imageId) => ({
    imageId,
    imageUrl: await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: `${userId}/${imageId}`,
      Expires: getUrlExpiration
    })
  })))
  return {
    ...memory,
    images
  }
}

const getMemories = async (userId) => {
  const memories = await memoriesDao.getMemories(userId)
  return Promise.all(memories.map(memory => addMemoryImageSignedUrls(userId, memory)))
}

const getMemory = async (userId, memoryId) => {
  const memory = await memoriesDao.getMemory(memoryId)
  if (!memory || memory.userId !== userId) {
    throw new createError.NotFound("Memory does not exist")
  }
  return addMemoryImageSignedUrls(userId, memory)
}

const updateMemory = async (userId, memory) => {
  await memoriesDao.updateMemory(userId, memory)
  return memory
}

const deleteMemory = async (userId, memoryId) => {
  await memoriesDao.deleteMemory(userId, memoryId)
  return {
    memoryId
  }
}

const deleteMemoryImage = async (userId, memoryId, imageId) => {
  await memoriesDao.deleteMemoryImage(userId, memoryId, imageId)
  return {
    memoryId,
    imageId
  }
}

module.exports = {
  createMemory,
  createImageAndGeneratePresignedUrls,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  deleteMemoryImage
}
