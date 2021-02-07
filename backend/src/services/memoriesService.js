const memoriesDao = require('../dao/memoriesDao')
const AWS = require("aws-sdk")
const AWSXRay = require("aws-xray-sdk")
const createError = require('http-errors')
const { v4: uuid } = require('uuid')
const utils = require('../utils')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.PHOTOS_S3_BUCKET_NAME
const getUrlExpiration = parseInt(process.env.GET_SIGNED_URL_EXPIRATION)
const postUrlExpiration = parseInt(process.env.POST_SIGNED_URL_EXPIRATION)
const logger = utils.createLogger('memoriesService')

const createMemory = async (userId) => {
  logger.info('Creating new memory', { userId })
  const memory = {
    memoryId: uuid(),
    userId,
    createdAt: (new Date()).toISOString(),
  }
  await memoriesDao.createMemory(memory)
  logger.info('Successfully created new memory', { userId })
  return memory
}

const createImageAndGeneratePresignedUrls = async (userId, memoryId) => {
  const imageId = uuid()
  logger.info("Adding new memory image", { userId, memoryId, imageId })
  await memoriesDao.addMemoryImage(userId, memoryId, imageId)
  logger.info("Successfully added new memory image", { userId, memoryId, imageId })
  logger.info("Generating presigned urls for new memory image", { userId, memoryId, imageId })
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
  logger.info("Successfully generated presigned urls for new memory image", { userId, memoryId, imageId })
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
  logger.info("Getting user memories", { userId })
  const memories = await memoriesDao.getMemories(userId)
  logger.info("Successfully retrieved user memories", { userId })
  return Promise.all(memories.map(memory => addMemoryImageSignedUrls(userId, memory)))
}

const getMemory = async (userId, memoryId) => {
  logger.info("Getting memory", { userId, memoryId })
  const memory = await memoriesDao.getMemory(memoryId)
  if (!memory || memory.userId !== userId) {
    logger.info("Memory does not exist", { userId, memoryId })
    throw new createError.NotFound("Memory does not exist")
  }
  logger.info("Successfully retrieved memory", { userId, memoryId })
  return addMemoryImageSignedUrls(userId, memory)
}

const updateMemory = async (userId, memory) => {
  logger.info("Updating memory", { userId, memoryId: memory.memoryId })
  await memoriesDao.updateMemory(userId, memory)
  logger.info("Successfully updated memory", { userId, memoryId: memory.memoryId })
  return memory
}

const deleteMemory = async (userId, memoryId) => {
  logger.info("Deleting memory", { userId, memoryId })
  await memoriesDao.deleteMemory(userId, memoryId)
  logger.info("Successfully deleted memory", { userId, memoryId })
  return {
    memoryId
  }
}

const deleteMemoryImage = async (userId, memoryId, imageId) => {
  logger.info("Deleting memory image", { userId, memoryId, imageId })
  await memoriesDao.deleteMemoryImage(userId, memoryId, imageId)
  logger.info("Successfully deleting memory image", { userId, memoryId, imageId })
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
