#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');

console.log('🧪 Testing SanitizeChain Integration');
console.log('=' .repeat(50));

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';
const BLOCKCHAIN_URL = 'http://localhost:8545';

async function testEndpoint(url, name) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${name}: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testBlockchainRPC() {
  try {
    const response = await fetch(BLOCKCHAIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Blockchain RPC: Connected (Block: ${parseInt(data.result, 16)})`);
      return true;
    } else {
      console.log(`❌ Blockchain RPC: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Blockchain RPC: ${error.message}`);
    return false;
  }
}

async function testBackendAPI() {
  console.log('\n📡 Testing Backend API...');
  
  const endpoints = [
    { url: `${BACKEND_URL}/api/health`, name: 'Health Check' },
    { url: `${BACKEND_URL}/api/ping`, name: 'Ping Endpoint' },
    { url: `${BACKEND_URL}/api/blockchain/status`, name: 'Blockchain Status' }
  ];
  
  let passed = 0;
  for (const endpoint of endpoints) {
    if (await testEndpoint(endpoint.url, endpoint.name)) {
      passed++;
    }
  }
  
  return passed === endpoints.length;
}

async function checkEnvironmentFiles() {
  console.log('\n📋 Checking Environment Configuration...');
  
  const files = [
    { path: '.env', name: 'Root Environment' },
    { path: 'backend/.env', name: 'Backend Environment' },
    { path: 'frontend/.env', name: 'Frontend Environment' }
  ];
  
  let allGood = true;
  
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      const content = fs.readFileSync(file.path, 'utf8');
      const hasContract = content.includes('CONTRACT_ADDRESS=');
      const status = hasContract ? '✅' : '⚠️';
      console.log(`${status} ${file.name}: ${hasContract ? 'Contract address configured' : 'Missing contract address'}`);
      if (!hasContract) allGood = false;
    } else {
      console.log(`❌ ${file.name}: File not found`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function main() {
  console.log('🔍 Running integration tests...\n');
  
  // Test 1: Environment files
  const envOk = checkEnvironmentFiles();
  
  // Test 2: Blockchain node
  console.log('\n⛓️  Testing Blockchain Node...');
  const blockchainOk = await testBlockchainRPC();
  
  // Test 3: Backend API
  const backendOk = await testBackendAPI();
  
  // Test 4: Frontend
  console.log('\n🌐 Testing Frontend...');
  const frontendOk = await testEndpoint(FRONTEND_URL, 'Frontend Server');
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Environment Configuration', status: envOk },
    { name: 'Blockchain Node', status: blockchainOk },
    { name: 'Backend API', status: backendOk },
    { name: 'Frontend Server', status: frontendOk }
  ];
  
  tests.forEach(test => {
    const status = test.status ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
  });
  
  const allPassed = tests.every(test => test.status);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('🚀 Your SanitizeChain platform is ready for development!');
    console.log('\n📋 Access your application:');
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log(`📡 Backend API: ${BACKEND_URL}/api`);
    console.log(`⛓️  Blockchain: ${BLOCKCHAIN_URL}`);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the setup.');
    console.log('💡 Run: pnpm run setup:local to fix configuration issues');
  }
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);