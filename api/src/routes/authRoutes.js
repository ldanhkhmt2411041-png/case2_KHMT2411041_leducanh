const express = require('express');
const router = express.Router();
const { 
  register, 
  verifyEmail, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
