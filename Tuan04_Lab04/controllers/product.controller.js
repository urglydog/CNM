const client = require('../config/db');
const { ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const categoryService = require('../services/category.service');
const productLogService = require('../services/productLog.service');

// Bảng Products_Lab04
const TABLE_NAME = process.env.TABLE_PRODUCTS_LAB04 || "Products_Lab04";

exports.list = async (req, res) => {
    try {
        const { search, categoryId, minPrice, maxPrice, page = 1, pageSize = 5 } = req.query;

        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'attribute_not_exists(isDeleted) OR isDeleted = :false',
            ExpressionAttributeValues: marshall({ ':false': false })
        };
        const data = await client.send(new ScanCommand(params));
        let products = (data.Items || []).map(item => unmarshall(item));

        // Lọc theo category
        if (categoryId) {
            products = products.filter(p => p.categoryId === categoryId);
        }

        // Lọc theo khoảng giá
        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;
        if (min !== null) {
            products = products.filter(p => typeof p.price === 'number' && p.price >= min);
        }
        if (max !== null) {
            products = products.filter(p => typeof p.price === 'number' && p.price <= max);
        }

        // Tìm theo tên (contains, không phân biệt hoa thường)
        if (search) {
            const keyword = search.toLowerCase();
            products = products.filter(p => (p.name || '').toLowerCase().includes(keyword));
        }

        // Phân trang trên kết quả đã lọc
        const currentPage = Math.max(1, parseInt(page) || 1);
        const size = Math.max(1, parseInt(pageSize) || 5);
        const totalItems = products.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / size));
        const safePage = Math.min(currentPage, totalPages);
        const start = (safePage - 1) * size;
        const end = start + size;
        const pagedProducts = products.slice(start, end);

        const categories = await categoryService.listCategories();

        res.render('products', {
            products: pagedProducts,
            categories,
            filters: { search, categoryId, minPrice, maxPrice },
            pagination: { currentPage: safePage, totalPages, pageSize: size, totalItems }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

exports.addPage = async (req, res) => {
    const categories = await categoryService.listCategories();
    res.render('add', { categories });
};

exports.add = async(req, res) => {
    try {
        const { id, name, price, quantity, categoryId } = req.body;
        
        // Lấy URL ảnh từ S3 do multer-s3 cung cấp
        // Nếu không có ảnh thì để chuỗi rỗng
        const url_image = req.file ? req.file.location : ""; 

        const item = {
            id,
            name,
            price: Number(price),
            quantity: Number(quantity || 0),
            categoryId,
            url_image,
            isDeleted: false,
            createdAt: new Date().toISOString()
        };

        await client.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(item)
        }));

        // Ghi log CREATE
        await productLogService.logAction(id, 'CREATE', req.session.user);
        res.redirect('/products');
    } catch (err) { res.status(500).send(err.message); }
};

exports.editPage = async(req, res) => {
    try {
        const params = { TableName: TABLE_NAME, Key: marshall({ id: req.params.id }) };
        const { Item } = await client.send(new GetItemCommand(params));
        if (!Item) return res.status(404).send("Sản phẩm không tồn tại");
        const categories = await categoryService.listCategories();
        res.render('edit', { product: unmarshall(Item), categories });
    } catch (err) { res.status(500).send(err.message); }
};

exports.update = async(req, res) => {
    try {
        const { name, price, quantity, categoryId } = req.body;
        const id = req.params.id;

        // Cấu hình biểu thức update cơ bản
        let updateExpression = "set #n = :name, price = :price, quantity = :quantity, categoryId = :categoryId";
        let expressionAttributeValues = {
            ":name": name,
            ":price": Number(price),
            ":quantity": Number(quantity || 0),
            ":categoryId": categoryId
        };

        // Nếu người dùng có upload ảnh mới, thêm trường url_image vào biểu thức
        if (req.file) {
            updateExpression += ", url_image = :url";
            expressionAttributeValues[":url"] = req.file.location;
        }

        const params = {
            TableName: TABLE_NAME,
            Key: marshall({ id }),
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: marshall(expressionAttributeValues)
        };

        await client.send(new UpdateItemCommand(params));

        // Ghi log UPDATE
        await productLogService.logAction(id, 'UPDATE', req.session.user);
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi cập nhật sản phẩm: " + err.message);
    }
};

// Soft delete: chỉ đánh dấu isDeleted = true
exports.delete = async(req, res) => {
    try {
        const id = req.params.id;
        const params = {
            TableName: TABLE_NAME,
            Key: marshall({ id }),
            UpdateExpression: 'set isDeleted = :true',
            ExpressionAttributeValues: marshall({ ':true': true })
        };
        await client.send(new UpdateItemCommand(params));

        // Ghi log DELETE (soft delete)
        await productLogService.logAction(id, 'DELETE', req.session.user);
        res.redirect('/products');
    } catch (err) { res.status(500).send(err.message); }
};