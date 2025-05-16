const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');

router.post('/signup',userController.signup);
router.post('/login',userController.signin);
router.post('/refresh-token', userController.refreshToken);
router.post("/signout", userController.signOut);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

module.exports = router;