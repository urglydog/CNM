const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');

router.get('/', auth, productController.list);
router.get('/add', auth, productController.addPage);
router.post('/add', auth, productController.add);
router.get('/edit/:id', auth, productController.editPage);
router.post('/edit/:id', auth, productController.update);
router.get('/delete/:id', auth, productController.delete);

module.exports = router;
