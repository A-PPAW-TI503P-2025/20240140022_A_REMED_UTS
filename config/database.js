const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize('library_management', 'root', 'Ridhanovita', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully.');
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error.message);
    }
};

module.exports = { sequelize, testConnection };
