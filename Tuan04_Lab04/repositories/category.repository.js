const client = require('../config/db');
const { PutItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const TABLE_NAME = process.env.TABLE_CATEGORIES || 'Categrories';

exports.getAllCategories = async () => {
  const data = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (data.Items || []).map((item) => unmarshall(item));
};

exports.getCategoryById = async (categoryId) => {
  const params = { TableName: TABLE_NAME, Key: marshall({ categoryId }) };
  const { Item } = await client.send(new GetItemCommand(params));
  return Item ? unmarshall(Item) : null;
};

exports.createCategory = async (category) => {
  const params = { TableName: TABLE_NAME, Item: marshall(category) };
  await client.send(new PutItemCommand(params));
};

exports.updateCategory = async (categoryId, data) => {
  const params = {
    TableName: TABLE_NAME,
    Key: marshall({ categoryId }),
    UpdateExpression: 'set #n = :name, description = :desc',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: marshall({ ':name': data.name, ':desc': data.description }),
  };
  await client.send(new UpdateItemCommand(params));
};

// Business rule: không xoá sản phẩm khi xoá category
exports.deleteCategory = async (categoryId) => {
  const params = { TableName: TABLE_NAME, Key: marshall({ categoryId }) };
  await client.send(new DeleteItemCommand(params));
};
