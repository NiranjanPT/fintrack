// Experiment 2 - Express application: middleware, routes and error handling
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// CLIENT_URL can hold one or more comma-separated frontend URLs
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like Postman (no origin) and any origin when CLIENT_URL is not set (local dev)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `Origin ${origin} not allowed by CORS`));
    },
    exposedHeaders: ['Content-Disposition'], // lets the browser read the CSV file name
  })
);

// Built-in middleware: parse JSON request bodies
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(logger);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'FinTrack API - see /api/health' });
});

// All REST API routes
app.use('/api', apiRoutes);

// 404 + error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
