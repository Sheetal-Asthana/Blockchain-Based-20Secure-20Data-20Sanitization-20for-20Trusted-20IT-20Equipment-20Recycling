import { createServer as createViteServer } from 'vite';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { connectDatabase } from './config/database';


// Import routes
import authRoutes from './routes/auth';
import assetRoutes from './routes/assets';
import analyticsRoutes from './routes/analytics';
import ipfsRoutes from './routes/ipfs';

async function startCleanDevServer() {
  console.log('🚀 Starting SanitizeChain Platform (Clean Mode)...\n');

  // Initialize database first
  await connectDatabase();

  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5600",
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "SanitizeChain Platform is healthy",
      timestamp: new Date(),
      version: "1.0.0",
      services: {
        database: "Connected",
        blockchain: "Ready",
        ipfs: "Ready"
      }
    });
  });

  // Ping endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({ 
      success: true,
      message: "pong",
      timestamp: new Date()
    });
  });

  // API routes (using Router-based routes to avoid path-to-regexp issues)
  console.log('📡 Registering API routes...');
  app.use("/api/auth", authRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api", ipfsRoutes);

  // Simple blockchain status endpoint (avoiding complex patterns)
  console.log('⛓️  Registering blockchain status...');
  app.get("/api/blockchain-status", async (_req, res) => {
    try {
      res.json({
        success: true,
        data: {
          available: true,
          contractAddress: process.env.CONTRACT_ADDRESS || null,
          network: "localhost"
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Blockchain status error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get blockchain status',
        timestamp: new Date()
      });
    }
  });

  // Create Vite server in middleware mode
  console.log('🔧 Setting up Vite development server...');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: process.cwd()
  });

  // Use vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // 404 handler for API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
      timestamp: new Date()
    });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      timestamp: new Date()
    });
  });

  const port = process.env.PORT || 5600;
  
  app.listen(port, () => {
    console.log(`\n🎉 SanitizeChain Platform Ready!`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
    console.log(`🔌 API: http://localhost:${port}/api`);
    console.log(`🏥 Health: http://localhost:${port}/api/health`);
    console.log(`📊 Database: Connected to MongoDB`);
    console.log(`⛓️  Blockchain: Contract at ${process.env.CONTRACT_ADDRESS}`);
    console.log(`📁 IPFS: Pinata service ready`);
    console.log(`\n✨ Visit http://localhost:${port} to get started!\n`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { disconnectDatabase } = await import('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const { disconnectDatabase } = await import('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startCleanDevServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export { startCleanDevServer };