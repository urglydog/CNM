const client = require('../config/db');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

// Bảng lưu lịch sử thao tác sản phẩm
const TABLE_NAME = process.env.TABLE_PRODUCT_LOGS_LAB04 || 'ProductLogs';

exports.createLog = async (log) => {
  const params = {
    TableName: TABLE_NAME,
    Item: marshall(log),
  };
  await client.send(new PutItemCommand(params));
};
