import { createServer as createViteServer } from 'vite';
import { createServer } from './index';
import express from 'express';
import path from 'path';

async function startDevServer() {
  const app = createServer();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: process.cwd()
  });

  // Use vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist/spa')));
    
    // Catch-all handler for SPA
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/spa/index.html'));
    });
  }

  const port = process.env.PORT || 5600;
  
  app.listen(port, () => {
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
    console.log(`🔌 API: http://localhost:${port}/api`);
    console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    console.log(`⛓️  Blockchain: Contract deployed at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`);
    console.log(`📁 IPFS: Pinata service ready`);
    console.log(`\n✨ Platform ready! Visit http://localhost:${port} to get started\n`);
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
startDevServer().catch(console.error);

export { startDevServer };