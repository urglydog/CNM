const client = require('../config/db');
const { ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const TableName = process.env.DYNAMODB_TABLE_NAME || "Products";

exports.list = async (req, res) => {
    try {
        const data = await client.send(new ScanCommand({ 
    TableName: process.env.TABLE_PRODUCTS // Nó sẽ lấy chữ "Products" từ .env
}));
        const products = data.Items.map(item => unmarshall(item));
        res.render('products', { products });
    } catch (err) { res.status(500).send(err.message); }
};

exports.addPage = (req, res) => res.render('add');

exports.add = async (req, res) => {
    const { id, name, price } = req.body; // DynamoDB cần ID thủ công
    const params = {
        TableName,
        Item: marshall({ id, name, price: Number(price) })
    };
    await client.send(new PutItemCommand(params));
    res.redirect('/products');
};

exports.editPage = async (req, res) => {
    const params = { TableName, Key: marshall({ id: req.params.id }) };
    const { Item } = await client.send(new GetItemCommand(params));
    res.render('edit', { product: unmarshall(Item) });
};

exports.update = async (req, res) => {
    const { name, price } = req.body;
    const params = {
        TableName,
        Key: marshall({ id: req.params.id }),
        UpdateExpression: "set #n = :name, price = :price",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: marshall({ ":name": name, ":price": Number(price) })
    };
    await client.send(new UpdateItemCommand(params));
    res.redirect('/products');
};

exports.delete = async (req, res) => {
    await client.send(new DeleteItemCommand({ TableName, Key: marshall({ id: req.params.id }) }));
    res.redirect('/products');
};