const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmap';

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      writeConcern: {
        w: 'majority',
      },
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`
    );
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

// Database utilities
const dbUtils = {
  // Check if database is connected
  isConnected: () => {
    return mongoose.connection.readyState === 1;
  },

  // Get connection stats
  getConnectionInfo: () => {
    const connection = mongoose.connection;
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      collections: Object.keys(connection.collections),
    };
  },

  // Health check for database
  healthCheck: async () => {
    try {
      if (!dbUtils.isConnected()) {
        throw new Error('Database not connected');
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();

      // Get database stats
      const stats = await mongoose.connection.db.stats();

      return {
        status: 'healthy',
        connection: dbUtils.getConnectionInfo(),
        stats: {
          collections: stats.collections,
          dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
          storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
          indexes: stats.indexes,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Create indexes for better performance
  createIndexes: async () => {
    try {
      // Job postings indexes
      await mongoose.connection.db
        .collection('jobpostings')
        .createIndex({ jobCategory: 1, experienceLevel: 1, region: 1 });
      await mongoose.connection.db
        .collection('jobpostings')
        .createIndex({ companyName: 1 });
      await mongoose.connection.db
        .collection('jobpostings')
        .createIndex({ createdAt: -1 });
      await mongoose.connection.db
        .collection('jobpostings')
        .createIndex({ keywords: 1 });

      // Analysis results indexes
      await mongoose.connection.db
        .collection('analysisresults')
        .createIndex({ jobCategory: 1, experienceLevel: 1 });
      await mongoose.connection.db
        .collection('analysisresults')
        .createIndex({ createdAt: -1 });

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create database indexes:', error.message);
    }
  },
};

module.exports = { connectDB, dbUtils };
