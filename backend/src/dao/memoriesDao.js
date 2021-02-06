const AWS = require("aws-sdk")
const AWSXRay = require("aws-xray-sdk")
const createError = require('http-errors')

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME
const memoriesByUserIndex = process.env.MEMORIES_BY_USER_INDEX_NAME

const createMemory = async (memory) => {
  await docClient.put({
    TableName: memoriesTable,
    Item: memory
  }).promise()
}

const addMemoryImage = async (userId, memoryId, imageId) => {
  try {
    await docClient.update({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "attribute_exists(memoryId) AND userId = :userId AND (attribute_not_exists(images) OR size (images) < :maxImages)",
      UpdateExpression: "ADD images :imageId",
      ExpressionAttributeValues: {
        ':userId': userId,
        ":imageId": docClient.createSet([imageId]),
        ":maxImages": 10
      },
    }).promise()
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      throw new createError.BadRequest("Unable to upload image")
    }
    throw err
  }
}

const getMemories = async (userId) => {
  return (await docClient.query({
    TableName: memoriesTable,
    IndexName: memoriesByUserIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false,
  }).promise()).Items
}

const getMemory = async (userId, memoryId) => {
  return (await docClient.get({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()).Item
}

const updateMemory = async (userId, memory) => {
  try {
    await docClient.update({
      TableName: memoriesTable,
      Key: {
        "memoryId": memory.memoryId
      },
      ConditionExpression: "attribute_exists(memoryId) AND userId = :userId",
      UpdateExpression: "set title = :title, description = :description ",
      ExpressionAttributeValues: {
        ':userId': userId,
        ":title": memory.title,
        ":description": memory.description,
      },
    }).promise()
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      throw new createError.BadRequest("Unable to update memory")
    }
    throw err
  }
}

const deleteMemory = async (userId, memoryId) => {
  try {
    await docClient.delete({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()
  } catch (err) {
    if (err.code !== 'ConditionalCheckFailedException') {
      throw err
    }
  }
}

const deleteMemoryImage = async (userId, memoryId, imageId) => {
  try {
    await docClient.update({
      TableName: memoriesTable,
      Key: {
        "memoryId": memoryId
      },
      ConditionExpression: "userId = :userId",
      UpdateExpression: "DELETE images :imageId",
      ExpressionAttributeValues: {
        ':userId': userId,
        ":imageId": docClient.createSet([imageId])
      },
    }).promise()
  } catch (err) {
    if (err.code !== 'ConditionalCheckFailedException') {
      throw err
    }
  }
}

module.exports = {
  createMemory,
  addMemoryImage,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  deleteMemoryImage
}
