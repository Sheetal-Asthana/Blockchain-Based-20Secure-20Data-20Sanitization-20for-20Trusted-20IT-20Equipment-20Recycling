import mongoose from 'mongoose';
import dotenv from "dotenv"
export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  ssl: boolean;
}

dotenv.config();

export const connectDatabase = async (): Promise<void> => {
  try {
    const dbUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
    }

    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(dbUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    })
    
    console.log('✅ MongoDB connected successfully');
    
    // Initialize database
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      // In development, still exit if no database - we want real data
      console.error('💥 Database connection required. Please set MONGODB_URI in your .env file');
      process.exit(1);
    }
  }
};

// Initialize database - no default users in production
async function initializeDatabase() {
  try {
    const { User } = await import('../models/User');
    
    // Just check if database connection is working
    const userCount = await User.countDocuments();
    console.log(`📊 Database initialized - ${userCount} users registered`);
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    console.log('🔌 Disconnecting from database...');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
};