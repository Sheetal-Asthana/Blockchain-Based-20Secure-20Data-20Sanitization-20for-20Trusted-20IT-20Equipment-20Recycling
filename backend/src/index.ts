import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { connectDatabase } from "./config/database.js";
import { handleDemo } from "./routes/demo.js";

// Import routes
import authRoutes from "./routes/auth.js";
import assetRoutes from "./routes/assets.js";
import analyticsRoutes from "./routes/analytics.js";
import ipfsRoutes from "./routes/ipfs.js";
import * as bulkRoutes from "./routes/bulk.js";
import blockchainRoutes from "./routes/blockchain.js";

function createServer(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:5173" // Vite default port
    ],
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
      message: "Backend server is healthy",
      timestamp: new Date(),
      version: process.env.npm_package_version || "1.0.0"
    });
  });

  // Legacy ping endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "Backend is running!";
    res.json({ 
      success: true,
      message: ping,
      timestamp: new Date()
    });
  });

  // Demo endpoint
  app.get("/api/demo", handleDemo);

  // API routes
  console.log('📡 Registering auth routes at /api/auth');
  app.use("/api/auth", authRoutes);
  console.log('📡 Registering asset routes at /api/assets');
  app.use("/api/assets", assetRoutes);
  console.log('📡 Registering analytics routes at /api/analytics');
  app.use("/api/analytics", analyticsRoutes);
  console.log('📡 Registering IPFS routes at /api');
  app.use("/api", ipfsRoutes);

  // Blockchain integration routes
  console.log('⛓️  Registering blockchain routes at /api/blockchain');
  app.use("/api/blockchain", blockchainRoutes);

  // Bulk operations routes
  app.post("/api/bulk/register", bulkRoutes.bulkRegisterAssets);
  app.post("/api/bulk/sanitize", bulkRoutes.bulkProveSanitization);
  app.post("/api/bulk/recycle", bulkRoutes.bulkRecycleAssets);
  app.post("/api/bulk/import-csv", bulkRoutes.importAssetsFromCSV);
  app.get("/api/bulk/export-csv", bulkRoutes.exportAssetsToCSV);
  app.post("/api/bulk/sanitization-report", bulkRoutes.generateBulkSanitizationReport);
  app.post("/api/bulk/schedule", bulkRoutes.scheduleBulkOperation);
  app.get("/api/bulk/template/:type", bulkRoutes.getBulkOperationTemplate);
  app.post("/api/bulk/validate", bulkRoutes.validateBulkData);

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

  return app;
}

async function startServer() {
  try {
    // Initialize database connection
    console.log('🔌 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ MongoDB connected successfully');

    // Create and start server
    const app = createServer();
    const port = process.env.PORT || 5000;
    
    app.listen(port, () => {
      console.log(`🚀 Backend server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { createServer };
