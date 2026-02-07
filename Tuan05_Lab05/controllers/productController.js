const express = require('express');
const router = express.Router();
const {dynamoDB, s3, TABLE_NAME, uuid} = require('../models/productModel');
const multer = require('multer');

// cấu hình lưu file ảnh
const upload = multer({ storage: multer.memoryStorage() });

// lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    const params = { TableName: TABLE_NAME };
    try {
        const data = await dynamoDB.scan(params).promise();
        res.render('index', { products: data.Items });
    } catch (error) {
        res.status(500).send(error);
    }
});

// thêm sản phẩm
router.post('/add', upload.single('image'), async (req, res) => {
    const { name, price } = req.body;
    const file = req.file;
    const id = uuid.v4();

    //upload lên s3
    const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${id}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const s3Data = await s3.upload(s3Params).promise();
        // lưu thông tin vào dynamoDB
        const dbParams = {
            TableName: TABLE_NAME,
            Item: {
                id: id,
                name: name,
                price: Number(price),
                url_image: s3Data.Location
            }
        };
        await dynamoDB.put(dbParams).promise();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
});

// hiển thị form chỉnh sửa sản phẩm
router.get('/edit/:id', async (req, res) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id: req.params.id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }
        res.render('edit', { product: data.Item });
    } catch (error) {
        res.status(500).send(error);
    }
});

// cập nhật sản phẩm
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { name, price, currentImage } = req.body;
    const file = req.file;

    let imageUrl = currentImage;

    try {
        // nếu có upload ảnh mới thì upload lên S3
        if (file) {
            const s3Params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `${req.params.id}-${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };
            const s3Data = await s3.upload(s3Params).promise();
            imageUrl = s3Data.Location;
        }

        const updateParams = {
            TableName: TABLE_NAME,
            Key: { id: req.params.id },
            UpdateExpression: 'SET #n = :name, price = :price, url_image = :url',
            ExpressionAttributeNames: {
                '#n': 'name'
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':price': Number(price),
                ':url': imageUrl
            }
        };

        await dynamoDB.update(updateParams).promise();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
});

// xóa sản phẩm
router.post('/delete/:id', async (req, res) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id: req.params.id }
    };
    try {
        await dynamoDB.delete(params).promise();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
