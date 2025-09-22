const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const jobRoutes = require('./routes/jobs');
const analysisRoutes = require('./routes/analysis');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chatRoutes');
const crawledJobRoutes = require('./routes/crawledJobs');

// Import database connection
const { connectDB } = require('./config/Database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Auto-seed data if database is empty (development only)
if (process.env.NODE_ENV !== 'production') {
  setTimeout(async () => {
    try {
      const CrawledJob = require('./models/CrawledJob');
      const jobCount = await CrawledJob.countDocuments();

      if (jobCount === 0) {
        console.log('📊 Database is empty, seeding test data...');
        const { seedTestData } = require('./utils/seedTestData');
        await seedTestData();
        console.log('🌱 Auto-seeding completed!');
      }
    } catch (error) {
      console.log('⚠️ Auto-seeding skipped:', error.message);
    }
  }, 2000); // Wait 2 seconds for DB connection
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting (disabled in development)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // API specific rate limiting
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 API requests per minute
    message: {
      error: 'API rate limit exceeded, please slow down',
      retryAfter: '1 minute',
    },
  });
  app.use('/api/analysis', apiLimiter);
} else {
  console.log('🚫 Rate limiting disabled in development environment');
}

// Basic middleware
app.use(compression());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://skillmap.app', 'https://www.skillmap.app']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Swagger
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
console.log('🔧 Loading crawled job routes...');
app.use('/api/crawled', crawledJobRoutes);
console.log('✅ Crawled job routes loaded');

// API health check
app.get('/api/health', async (req, res) => {
  try {
    // Database connection check
    const mongoose = require('mongoose');
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Python environment check (for crawling)
    const { exec } = require('child_process');
    const pythonCheck = await new Promise((resolve) => {
      exec('python --version', (error, stdout) => {
        resolve(error ? 'unavailable' : stdout.trim());
      });
    });

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        python: pythonCheck,
        redis: 'not_configured', // TODO: Add Redis check if needed
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  const mongoose = require('mongoose');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  const mongoose = require('mongoose');
  mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillMap Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📈 Health Check: http://localhost:${PORT}/health`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `🐍 Python Crawling: ${path.join(__dirname, '../web-crawling')}`
    );
  }
});

module.exports = app;
