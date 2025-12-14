#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Local Blockchain Development Environment');
console.log('=' .repeat(60));

let hardhatProcess = null;
let backendProcess = null;
let frontendProcess = null;

// Cleanup function
function cleanup() {
  console.log('\n🧹 Cleaning up processes...');
  
  if (hardhatProcess) {
    hardhatProcess.kill('SIGTERM');
    console.log('✅ Hardhat node stopped');
  }
  
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    console.log('✅ Backend server stopped');
  }
  
  if (frontendProcess) {
    frontendProcess.kill('SIGTERM');
    console.log('✅ Frontend server stopped');
  }
  
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function startHardhatNode() {
  return new Promise((resolve, reject) => {
    console.log('🔗 Starting Hardhat local node...');
    
    hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      cwd: path.join(__dirname, 'blockchain'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let nodeStarted = false;

    hardhatProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Hardhat] ${output.trim()}`);
      
      if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !nodeStarted) {
        nodeStarted = true;
        console.log('✅ Hardhat node is running on http://localhost:8545');
        setTimeout(resolve, 2000); // Wait 2 seconds for node to be fully ready
      }
    });

    hardhatProcess.stderr.on('data', (data) => {
      console.error(`[Hardhat Error] ${data.toString().trim()}`);
    });

    hardhatProcess.on('close', (code) => {
      if (code !== 0 && !nodeStarted) {
        reject(new Error(`Hardhat node exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!nodeStarted) {
        reject(new Error('Hardhat node failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

async function deployContract() {
  return new Promise((resolve, reject) => {
    console.log('📜 Deploying smart contract...');
    
    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
      cwd: path.join(__dirname, 'blockchain'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let deploymentOutput = '';

    deployProcess.stdout.on('data', (data) => {
      const output = data.toString();
      deploymentOutput += output;
      console.log(`[Deploy] ${output.trim()}`);
    });

    deployProcess.stderr.on('data', (data) => {
      console.error(`[Deploy Error] ${data.toString().trim()}`);
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        // Extract contract address from deployment output
        const addressMatch = deploymentOutput.match(/Contract address: (0x[a-fA-F0-9]{40})/);
        if (addressMatch) {
          const contractAddress = addressMatch[1];
          console.log('✅ Contract deployed successfully!');
          
          // Update environment files with contract address
          updateEnvironmentFiles(contractAddress);
          resolve(contractAddress);
        } else {
          reject(new Error('Could not extract contract address from deployment output'));
        }
      } else {
        reject(new Error(`Contract deployment failed with code ${code}`));
      }
    });
  });
}

function updateEnvironmentFiles(contractAddress) {
  console.log('📝 Updating environment files with contract address...');
  
  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    backendEnv = backendEnv.replace(/CONTRACT_ADDRESS=".*"/, `CONTRACT_ADDRESS="${contractAddress}"`);
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Updated backend/.env');
  }
  
  // Update root .env
  const rootEnvPath = path.join(__dirname, '.env');
  if (fs.existsSync(rootEnvPath)) {
    let rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
    rootEnv = rootEnv.replace(/CONTRACT_ADDRESS=".*"/, `CONTRACT_ADDRESS="${contractAddress}"`);
    fs.writeFileSync(rootEnvPath, rootEnv);
    console.log('✅ Updated .env');
  }
}

async function startBackend() {
  return new Promise((resolve) => {
    console.log('🖥️  Starting backend server...');
    
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let backendStarted = false;

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('Backend server running on port') && !backendStarted) {
        backendStarted = true;
        console.log('✅ Backend server is running on http://localhost:5000');
        setTimeout(resolve, 2000);
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!backendStarted) {
        console.log('⚠️  Backend server taking longer than expected to start');
        resolve(); // Continue anyway
      }
    }, 30000);
  });
}

async function startFrontend() {
  return new Promise((resolve) => {
    console.log('🌐 Starting frontend server...');
    
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let frontendStarted = false;

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      if (output.includes('Local:') && !frontendStarted) {
        frontendStarted = true;
        console.log('✅ Frontend server is running');
        setTimeout(resolve, 2000);
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error(`[Frontend Error] ${data.toString().trim()}`);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!frontendStarted) {
        console.log('⚠️  Frontend server taking longer than expected to start');
        resolve(); // Continue anyway
      }
    }, 30000);
  });
}

async function main() {
  try {
    // Step 1: Start Hardhat node
    await startHardhatNode();
    
    // Step 2: Deploy contract
    const contractAddress = await deployContract();
    
    // Step 3: Start backend
    await startBackend();
    
    // Step 4: Start frontend
    await startFrontend();
    
    console.log('\n' + '🎉'.repeat(20));
    console.log('🚀 ALL SERVICES STARTED SUCCESSFULLY!');
    console.log('🎉'.repeat(20));
    console.log('\n📋 Service URLs:');
    console.log('🔗 Hardhat Node: http://localhost:8545');
    console.log('🖥️  Backend API: http://localhost:5000');
    console.log('🌐 Frontend App: http://localhost:5173');
    console.log(`📜 Contract Address: ${contractAddress}`);
    console.log('\n💡 Press Ctrl+C to stop all services');
    
    // Keep the process running
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error.message);
    cleanup();
    process.exit(1);
  }
}

main();