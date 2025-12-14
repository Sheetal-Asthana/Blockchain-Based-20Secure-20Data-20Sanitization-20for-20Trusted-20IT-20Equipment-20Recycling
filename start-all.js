#!/usr/bin/env node

console.log('🚀 Starting SanitizeChain Platform...\n');

console.log('📋 Setup Instructions:');
console.log('1. Make sure MongoDB is running on localhost:27017');
console.log('2. Configure environment files:');
console.log('   - frontend/.env');
console.log('   - backend/.env');
console.log('   - blockchain/.env');
console.log('');

console.log('🔧 To start services manually:');
console.log('');
console.log('Terminal 1 - Blockchain:');
console.log('cd blockchain && pnpm run node');
console.log('');
console.log('Terminal 2 - Backend:');
console.log('cd backend && pnpm dev');
console.log('');
console.log('Terminal 3 - Frontend:');
console.log('cd frontend && pnpm dev');
console.log('');

console.log('🌐 Access URLs:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:5000/api');
console.log('- Blockchain RPC: http://localhost:8545');
console.log('');

console.log('✅ Platform separation complete!');
console.log('Each service now runs independently with its own:');
console.log('- package.json and dependencies');
console.log('- Environment configuration');
console.log('- Port assignment');
console.log('- TypeScript configuration');