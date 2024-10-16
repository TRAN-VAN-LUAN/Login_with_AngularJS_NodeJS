const express = require('express');
const router = express.Router();
const authController = require('../Controllers/Auth.Controller');

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng nhập người dùng
router.post('/login', authController.login);

// Làm mới access token bằng refresh token
router.post('/refresh-token', authController.refreshToken);

// Đăng xuất người dùng
router.post('/logout', authController.logout);

module.exports = router;
