#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting SanitizeChain Platform Development Environment...\n');

const services = [
  {
    name: 'Blockchain',
    command: 'pnpm',
    args: ['run', 'node'],
    cwd: join(__dirname, 'blockchain'),
    color: '\x1b[33m', // Yellow
    port: 8545
  },
  {
    name: 'Backend',
    command: 'pnpm',
    args: ['dev'],
    cwd: join(__dirname, 'backend'),
    color: '\x1b[32m', // Green
    port: 5000
  },
  {
    name: 'Frontend',
    command: 'pnpm',
    args: ['dev'],
    cwd: join(__dirname, 'frontend'),
    color: '\x1b[36m', // Cyan
    port: 3000
  }
];

const processes = [];

// Start each service
services.forEach((service, index) => {
  setTimeout(() => {
    console.log(`${service.color}🔧 Starting ${service.name} on port ${service.port}...\x1b[0m`);
    
    const process = spawn(service.command, service.args, {
      cwd: service.cwd,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${service.color}[${service.name}]\x1b[0m ${line}`);
      });
    });

    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${service.color}[${service.name}]\x1b[31m ERROR:\x1b[0m ${line}`);
      });
    });

    process.on('close', (code) => {
      console.log(`${service.color}[${service.name}]\x1b[0m Process exited with code ${code}`);
    });

    processes.push(process);
  }, index * 2000); // Stagger startup by 2 seconds
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  process.exit(0);
});

// Show startup complete message after all services have had time to start
setTimeout(() => {
  console.log('\n✅ All services started!');
  console.log('📱 Frontend: http://localhost:3000');
  console.log('🔗 Backend API: http://localhost:5000/api');
  console.log('⛓️  Blockchain RPC: http://localhost:8545');
  console.log('\nPress Ctrl+C to stop all services');
}, 10000);