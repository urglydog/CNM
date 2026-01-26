const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const multer = require('multer');

// Cấu hình lưu trữ tạm thời trong bộ nhớ để chuẩn bị đẩy lên S3
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', auth, productController.list);
router.get('/add', auth, productController.addPage);

// Thêm upload.single('image') vào đây để xử lý req.body
router.post('/add', auth, upload.single('image'), productController.add);

router.get('/edit/:id', auth, productController.editPage);

// Thêm upload.single('image') vào đây để xử lý req.body khi update
router.post('/edit/:id', auth, upload.single('image'), productController.update);

router.get('/delete/:id', auth, productController.delete);

module.exports = router;