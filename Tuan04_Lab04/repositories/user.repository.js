const client = require('../config/db');
const { PutItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const TABLE_NAME = process.env.TABLE_USERS || 'Users_Lab04';

exports.createUser = async (user) => {
  const params = {
    TableName: TABLE_NAME,
    Item: marshall(user),
  };
  await client.send(new PutItemCommand(params));
};

// Login theo username: dùng Scan + FilterExpression vì username không phải PK
exports.getUserByUsername = async (username) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: '#u = :username',
    ExpressionAttributeNames: { '#u': 'username' },
    ExpressionAttributeValues: marshall({ ':username': username }),
  };

  const data = await client.send(new ScanCommand(params));
  if (!data.Items || data.Items.length === 0) return null;
  return unmarshall(data.Items[0]);
};
