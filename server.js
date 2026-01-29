const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Root endpoint - redirect to frontend
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Library Management API - Location-Based Borrowing',
    version: '1.0.0',
    endpoints: {
      public: [
        'GET /api/books - Get all books',
        'GET /api/books/:id - Get book by ID'
      ],
      admin: [
        'POST /api/books - Create book (x-user-role: admin)',
        'PUT /api/books/:id - Update book (x-user-role: admin)',
        'DELETE /api/books/:id - Delete book (x-user-role: admin)'
      ],
      user: [
        'POST /api/borrow - Borrow book (x-user-role: user, x-user-id: [id])'
      ]
    },
    frontend: 'http://localhost:5000/'
  });
});

// API Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    await syncDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API ready to accept requests`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
