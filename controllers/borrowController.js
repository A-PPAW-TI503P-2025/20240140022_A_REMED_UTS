const { Book, BorrowLog, sequelize } = require('../models');

const borrowBook = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { bookId, latitude, longitude } = req.body;
        const userId = req.userId;

        if (!bookId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'bookId is required'
            });
        }

        if (latitude === undefined || longitude === undefined) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'latitude and longitude are required'
            });
        }

        if (latitude < -90 || latitude > 90) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid latitude. Must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid longitude. Must be between -180 and 180'
            });
        }

        const book = await Book.findByPk(bookId, { transaction });

        if (!book) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: `Book with id ${bookId} not found`
            });
        }

        if (book.stock <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Book is out of stock'
            });
        }

        await book.update(
            { stock: book.stock - 1 },
            { transaction }
        );

        const borrowLog = await BorrowLog.create({
            userId,
            bookId,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            borrowDate: new Date()
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Book borrowed successfully',
            data: {
                borrowId: borrowLog.id,
                userId: borrowLog.userId,
                bookId: borrowLog.bookId,
                bookTitle: book.title,
                borrowDate: borrowLog.borrowDate,
                location: {
                    latitude: borrowLog.latitude,
                    longitude: borrowLog.longitude
                },
                remainingStock: book.stock - 1
            }
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: 'Error borrowing book',
            error: error.message
        });
    }
};

module.exports = {
    borrowBook
};
