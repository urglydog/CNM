const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/register', authController.registerPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;
