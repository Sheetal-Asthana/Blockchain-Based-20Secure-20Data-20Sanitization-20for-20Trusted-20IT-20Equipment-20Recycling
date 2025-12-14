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
import dotenv from "dotenv";
dotenv.config();

async function startSimpleDevServer() {
  console.log('🚀 Initializing SanitizeChain Platform...\n');

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
      message: "Server is healthy",
      timestamp: new Date(),
      version: "1.0.0"
    });
  });

  // Legacy ping endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ 
      success: true,
      message: ping,
      timestamp: new Date()
    });
  });

  // API routes
  console.log('📡 Registering API routes...');
  app.use("/api/auth", authRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api", ipfsRoutes);

  // Simple blockchain routes (avoiding complex patterns)
  console.log('⛓️  Registering blockchain routes...');
  const { blockchainService } = await import('./services/BlockchainService');
  
  app.get("/api/blockchain/status", async (_req, res) => {
    try {
      const isAvailable = blockchainService.isAvailable();
      const networkInfo = await blockchainService.getNetworkInfo();
      
      res.json({
        success: true,
        data: {
          available: isAvailable,
          network: networkInfo,
          contractAddress: process.env.CONTRACT_ADDRESS || null
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
    console.error('Global error handler:', err);
    
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
    console.log(`📊 Database: Connected to MongoDB`);
    console.log(`⛓️  Blockchain: Contract at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`);
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
startSimpleDevServer().catch(console.error);

export { startSimpleDevServer };