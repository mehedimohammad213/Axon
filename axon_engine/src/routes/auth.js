const express = require('express');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();
router.use(authenticate);

router.post('/admin/logout', authController.logout);
router.get('/admin/user', authController.me);
router.put('/admin/password/change', authController.changePassword);

router.get('/admin/users', userController.index);
router.post('/admin/user', userController.store);
router.put('/admin/user/:id', userController.update);
router.delete('/admin/user/:id', userController.destroy);

module.exports = router;
