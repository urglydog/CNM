const client = require('../config/db');
const { ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const TableName = process.env.DYNAMODB_TABLE_NAME || "Products";

exports.list = async(req, res) => {
    try {
        const data = await client.send(new ScanCommand({
            TableName: process.env.TABLE_PRODUCTS // Nó sẽ lấy chữ "Products" từ .env
        }));
        const products = data.Items.map(item => unmarshall(item));
        res.render('products', { products });
    } catch (err) { res.status(500).send(err.message); }
};

exports.addPage = (req, res) => res.render('add');

exports.add = async(req, res) => {
    const { id, name, price } = req.body; // DynamoDB cần ID thủ công
    const params = {
        TableName,
        Item: marshall({ id, name, price: Number(price) })
    };
    await client.send(new PutItemCommand(params));
    res.redirect('/products');
};

exports.editPage = async(req, res) => {
    const params = { TableName, Key: marshall({ id: req.params.id }) };
    const { Item } = await client.send(new GetItemCommand(params));
    res.render('edit', { product: unmarshall(Item) });
};

exports.update = async(req, res) => {
    try {
        // req.body bây giờ sẽ có giá trị nhờ middleware upload.single('image') ở route
        const { name, price } = req.body;
        const id = req.params.id;

        // Xử lý URL ảnh: nếu có file mới thì dùng URL mới, nếu không giữ URL cũ
        // Lưu ý: Bạn sẽ cần thêm logic upload S3 ở đây để có URL thực tế
        let imageUrl = req.body.current_url_image;

        const params = {
            TableName,
            Key: marshall({ id }),
            UpdateExpression: "set #n = :name, price = :price",
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: marshall({
                ":name": name,
                ":price": Number(price)
            })
        };

        await client.send(new UpdateItemCommand(params));
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi cập nhật sản phẩm: " + err.message);
    }
};

exports.delete = async(req, res) => {
    await client.send(new DeleteItemCommand({ TableName, Key: marshall({ id: req.params.id }) }));
    res.redirect('/products');
};