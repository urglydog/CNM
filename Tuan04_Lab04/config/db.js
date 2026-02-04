const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

// Sử dụng Default Credentials Provider của AWS SDK
// (ưu tiên IAM Role trên EC2, sau đó mới tới biến môi trường nếu có)
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
});

module.exports = client;