const { sequelize } = require('../config/database');
const Book = require('./Book');
const BorrowLog = require('./BorrowLog');

BorrowLog.belongsTo(Book, {
    foreignKey: 'bookId',
    as: 'book'
});

Book.hasMany(BorrowLog, {
    foreignKey: 'bookId',
    as: 'borrowLogs',
    onDelete: 'CASCADE'
});

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✓ Database synchronized successfully.');
    } catch (error) {
        console.error('✗ Error synchronizing database:', error.message);
    }
};

module.exports = {
    sequelize,
    Book,
    BorrowLog,
    syncDatabase
};
