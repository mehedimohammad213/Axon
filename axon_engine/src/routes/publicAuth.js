const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/admin/register', authController.register);
router.post('/admin/login', authController.login);
router.post('/admin/password/forget', authController.forgetPassword);
router.post('/admin/password/reset', authController.resetPassword);

module.exports = router;
