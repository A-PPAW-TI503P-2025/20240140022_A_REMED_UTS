const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/roleAuth');
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Admin routes
router.post('/', checkAdmin, createBook);
router.put('/:id', checkAdmin, updateBook);
router.delete('/:id', checkAdmin, deleteBook);

module.exports = router;
