const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../lib/awsClient");

const tableName = process.env.DYNAMODB_TABLE_NAME;

async function getItems() {
    if (!tableName) {
        return [];
    }

    const command = new ScanCommand({
        TableName: tableName,
        Limit: 20,
    });

    const result = await dynamoDb.send(command);
    return result.Items || [];
}

module.exports = {
    getItems,
};