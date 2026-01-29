const express = require('express');
const router = express.Router();
const { checkUser } = require('../middleware/roleAuth');
const { borrowBook } = require('../controllers/borrowController');

// User route - borrow book with geolocation
router.post('/', checkUser, borrowBook);

module.exports = router;
