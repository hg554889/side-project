/**
 * 404 Not Found Middleware
 * Handles requests to non-existent endpoints
 */

const notFound = (req, res, next) => {
  // Log the 404 request for debugging
  console.warn('🔍 404 Not Found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Create error object
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';

  // Pass to error handler
  next(error);
};

module.exports = notFound;
