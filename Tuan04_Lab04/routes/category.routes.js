const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');

// Staff + Admin: xem danh sách
router.get('/', auth, categoryController.listPage);

// Chỉ admin: CRUD
router.get('/add', auth, authorizeRole('admin'), categoryController.addPage);
router.post('/add', auth, authorizeRole('admin'), categoryController.add);
router.get('/edit/:id', auth, authorizeRole('admin'), categoryController.editPage);
router.post('/edit/:id', auth, authorizeRole('admin'), categoryController.update);
router.get('/delete/:id', auth, authorizeRole('admin'), categoryController.delete);

module.exports = router;
