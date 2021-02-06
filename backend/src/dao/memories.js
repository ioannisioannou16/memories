const AWS = require("aws-sdk")
const AWSXRay = require("aws-xray-sdk")

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const memoriesTable = process.env.MEMORIES_TABLE_NAME
const memoriesByUserIndex = process.env.MEMORIES_BY_USER_INDEX_NAME

const createMemory = (memory) => {
  return docClient.put({
    TableName: memoriesTable,
    Item: memory
  }).promise()
}

const addMemoryImage = (userId, memoryId, imageId) => {
  return docClient.update({
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

const updateMemory = (userId, memoryId, memory) => {
  return docClient.update({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "attribute_exists(memoryId) AND userId = :userId",
    UpdateExpression: "set title = :title, description = :description ",
    ExpressionAttributeValues: {
      ':userId': userId,
      ":title": memory.title,
      ":description": memory.description,
    },
  }).promise()
}

const deleteMemory = (userId, memoryId) => {
  return docClient.delete({
    TableName: memoriesTable,
    Key: {
      "memoryId": memoryId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ':userId': userId
    },
  }).promise()
}

const deleteMemoryImage = (userId, memoryId, imageId) => {
  return docClient.update({
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
}

module.exports = {
  createMemory,
  addMemoryImage,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemoryImage,
  deleteMemory
}
