/**
 * Request Logger Middleware
 * Logs incoming requests and assigns request IDs
 */

const { v4: uuidv4 } = require('uuid');

const requestLogger = (req, res, next) => {
  // Assign unique request ID
  req.id = uuidv4();

  // Start timer
  const startTime = Date.now();

  // Log request
  const logData = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
  };

  // Don't log sensitive data
  if (logData.body && logData.body.password) {
    logData.body = { ...logData.body, password: '[REDACTED]' };
  }

  console.log('📨 Incoming Request:', logData);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    console.log('📤 Response:', {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size: JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
    });

    return originalJson.call(this, data);
  };

  // Override res.send to log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    console.log('📤 Response:', {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size:
        typeof data === 'string' ? data.length : JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
    });

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
