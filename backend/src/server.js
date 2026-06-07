import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/index.js';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import { seedAll } from './utils/seed.js';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading uploaded images on frontend
}));

// CORS configuration validation
if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  WARNING: FRONTEND_URL is not defined in environment variables. Production CORS requests will fail.');
}

// Secure production-ready CORS configuration allowing production frontend and local dev environment
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// TEMPORARY CORS TEST
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request parsers
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true }));

// Request parsers
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (console)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logger middleware (JSON file logging + analytics)
app.use(loggerMiddleware);

// General rate limiter
if (config.nodeEnv === 'production') {
  app.use(rateLimiter);
}

// Serve static uploaded files
app.use('/uploads', express.static(uploadDir));

// Mount main API router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`
  });
});

// Global error handler
app.use(errorMiddleware);

// Initialize server
async function startServer() {
  try {
    // Run initial data seeding
    await seedAll();

    app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`👉 API Docs: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
