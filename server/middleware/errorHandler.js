/**
 * Global Error Handler Middleware
 * Handles all errors that occur in the application
 */

const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      message,
      statusCode: 400,
      code: 'INVALID_ID',
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value for ${field}`;
    error = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD',
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = {
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      code: 'INVALID_TOKEN',
    };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      code: 'TOKEN_EXPIRED',
    };
  }

  // Database connection error
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    const message = 'Database connection error';
    error = {
      message,
      statusCode: 503,
      code: 'DATABASE_ERROR',
    };
  }

  // Python script execution error
  if (err.message && err.message.includes('Python')) {
    const message = 'Crawling service unavailable';
    error = {
      message,
      statusCode: 503,
      code: 'CRAWLING_ERROR',
    };
  }

  // Rate limit error
  if (err.message && err.message.includes('rate limit')) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // File upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 413,
      code: 'FILE_TOO_LARGE',
    };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal server error';
  const code = error.code || 'INTERNAL_ERROR';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: error,
      }),
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
    },
  });
};

module.exports = errorHandler;
