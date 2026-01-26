const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require("@aws-sdk/client-s3");

// 1. Cấu hình S3 Client
const s3 = new S3Client({ 
    region: process.env.AWS_REGION || "ap-southeast-2" 
});

// 2. Cấu hình Multer-S3 để đẩy ảnh trực tiếp lên S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME || "images2026",
        acl: 'public-read', // Quan trọng để hiển thị ảnh trên web
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, `products/${Date.now()}_${file.originalname}`);
        }
    })
});

router.get('/', auth, productController.list);
router.get('/add', auth, productController.addPage);

// Route add: Multer-S3 sẽ tự upload và gán link vào req.file.location
router.post('/add', auth, upload.single('image'), productController.add);

router.get('/edit/:id', auth, productController.editPage);

// Route update: Tương tự xử lý khi sửa sản phẩm
router.post('/edit/:id', auth, upload.single('image'), productController.update);

router.get('/delete/:id', auth, productController.delete);

module.exports = router;