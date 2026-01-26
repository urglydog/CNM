const client = require('../config/db');
const { ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Ưu tiên lấy tên table từ file .env bạn đã cấu hình trên EC2
const TableName = process.env.TABLE_PRODUCTS || "Products";

exports.list = async(req, res) => {
    try {
        const data = await client.send(new ScanCommand({ TableName }));
        const products = data.Items.map(item => unmarshall(item));
        res.render('products', { products });
    } catch (err) { res.status(500).send(err.message); }
};

exports.addPage = (req, res) => res.render('add');

exports.add = async(req, res) => {
    try {
        const { id, name, price } = req.body;
        
        // Lấy URL ảnh từ S3 do multer-s3 cung cấp
        // Nếu không có ảnh thì để chuỗi rỗng
        const url_image = req.file ? req.file.location : ""; 

        const params = {
            TableName,
            Item: marshall({ 
                id, 
                name, 
                price: Number(price),
                url_image: url_image // Lưu link ảnh S3 vào database
            })
        };
        await client.send(new PutItemCommand(params));
        res.redirect('/products');
    } catch (err) { res.status(500).send(err.message); }
};

exports.editPage = async(req, res) => {
    try {
        const params = { TableName, Key: marshall({ id: req.params.id }) };
        const { Item } = await client.send(new GetItemCommand(params));
        if (!Item) return res.status(404).send("Sản phẩm không tồn tại");
        res.render('edit', { product: unmarshall(Item) });
    } catch (err) { res.status(500).send(err.message); }
};

exports.update = async(req, res) => {
    try {
        const { name, price } = req.body;
        const id = req.params.id;

        // Cấu hình biểu thức update cơ bản
        let updateExpression = "set #n = :name, price = :price";
        let expressionAttributeValues = {
            ":name": name,
            ":price": Number(price)
        };

        // Nếu người dùng có upload ảnh mới, thêm trường url_image vào biểu thức
        if (req.file) {
            updateExpression += ", url_image = :url";
            expressionAttributeValues[":url"] = req.file.location;
        }

        const params = {
            TableName,
            Key: marshall({ id }),
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: marshall(expressionAttributeValues)
        };

        await client.send(new UpdateItemCommand(params));
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi cập nhật sản phẩm: " + err.message);
    }
};

exports.delete = async(req, res) => {
    try {
        await client.send(new DeleteItemCommand({ TableName, Key: marshall({ id: req.params.id }) }));
        res.redirect('/products');
    } catch (err) { res.status(500).send(err.message); }
};