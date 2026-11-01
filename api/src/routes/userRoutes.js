const express = require('express');
const router = express.Router();
const { searchUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/search', searchUsers);
router.get('/:id', getUserById);

module.exports = router;
