const { Book, BorrowLog } = require('../models');

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            order: [['id', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving books',
            error: error.message
        });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book with id ${id} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving book',
            error: error.message
        });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, author, stock } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required and cannot be empty'
            });
        }

        if (!author || author.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Author is required and cannot be empty'
            });
        }

        const book = await Book.create({
            title: title.trim(),
            author: author.trim(),
            stock: stock || 0
        });

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating book',
            error: error.message
        });
    }
};

const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, stock } = req.body;

        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book with id ${id} not found`
            });
        }

        if (title !== undefined && title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title cannot be empty'
            });
        }

        if (author !== undefined && author.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Author cannot be empty'
            });
        }

        await book.update({
            title: title?.trim() || book.title,
            author: author?.trim() || book.author,
            stock: stock !== undefined ? stock : book.stock
        });

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating book',
            error: error.message
        });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        const book = await Book.findByPk(id, {
            include: [{
                model: BorrowLog,
                as: 'borrowLogs'
            }]
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book with id ${id} not found`
            });
        }

        const borrowCount = book.borrowLogs ? book.borrowLogs.length : 0;

        if (borrowCount > 0) {
            await BorrowLog.destroy({
                where: { bookId: id }
            });
        }

        await book.destroy();

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            info: borrowCount > 0
                ? `${borrowCount} borrow log(s) juga dihapus`
                : 'No borrow logs to delete'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting book',
            error: error.message
        });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
