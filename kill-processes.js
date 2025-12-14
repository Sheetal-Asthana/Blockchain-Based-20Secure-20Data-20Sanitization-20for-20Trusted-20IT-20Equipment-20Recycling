#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';

console.log('🧹 Cleaning up existing processes...');

function killProcessOnPort(port) {
  try {
    if (os.platform() === 'win32') {
      // Windows
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          console.log(`🔪 Killing process ${pid} on port ${port}`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        }
      }
    } else {
      // Unix/Linux/macOS
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
      const pids = result.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        console.log(`🔪 Killing process ${pid} on port ${port}`);
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      }
    }
    
    console.log(`✅ Port ${port} is now free`);
  } catch (error) {
    console.log(`ℹ️  No process found on port ${port} or already killed`);
  }
}

// Kill processes on common ports
const ports = [8545, 5000, 5173, 3000];

for (const port of ports) {
  killProcessOnPort(port);
}

console.log('✅ Cleanup complete!');