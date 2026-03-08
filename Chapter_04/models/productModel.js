// nơi làm việc với dynamoDB và s3
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// chỉ cần set region
AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const TABLE_NAME = process.env.TABLE_PRODUCTS;

module.exports = {
    dynamoDB,
    s3,
    TABLE_NAME,
    uuid: { v4: uuidv4 }
};