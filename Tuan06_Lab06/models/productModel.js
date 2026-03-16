const { CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { client, docClient } = require("../config/db");

const TABLE_NAME = "Products";

// Khởi tạo bảng nếu chưa tồn tại
const initTable = async() => {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        console.log("Table 'Products' already exists.");
    } catch (err) {
        if (err.name === "ResourceNotFoundException") {
            const params = {
                TableName: TABLE_NAME,
                KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
                AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            };
            await client.send(new CreateTableCommand(params));
            console.log("Created table 'Products'.");
        } else {
            console.error("Error checking table:", err);
        }
    }
};

const Product = {
    getAll: async() => {
        const { Items } = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
        return Items;
    },
    getById: async(id) => {
        const { Item } = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
        return Item;
    },
    add: async(product) => {
        await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: product }));
    },
    update: async(id, data) => {
        let updateExpression = "set #name = :name, price = :price, unit_in_stock = :unit_in_stock";
        let expressionAttributeValues = {
            ":name": data.name,
            ":price": Number(data.price),
            ":unit_in_stock": Number(data.unit_in_stock)
        };

        if (data.url_image) {
            updateExpression += ", url_image = :url_image";
            expressionAttributeValues[":url_image"] = data.url_image;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: { "#name": "name" },
            ExpressionAttributeValues: expressionAttributeValues
        };
        await docClient.send(new UpdateCommand(params));
    },
    delete: async(id) => {
        await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
    }
};

module.exports = { Product, initTable };