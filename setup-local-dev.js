#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Local Development Environment');
console.log('=' .repeat(60));

let hardhatProcess = null;

// Cleanup function
function cleanup() {
  console.log('\n🧹 Cleaning up...');
  if (hardhatProcess) {
    hardhatProcess.kill('SIGTERM');
    console.log('✅ Hardhat node stopped');
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
        setTimeout(resolve, 3000); // Wait 3 seconds for node to be fully ready
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
  console.log('📜 Deploying smart contract...');
  
  try {
    const output = execSync('npx hardhat run scripts/deploy.js --network localhost', {
      cwd: path.join(__dirname, 'blockchain'),
      encoding: 'utf8'
    });
    
    console.log(output);
    
    // Extract contract address from output
    const addressMatch = output.match(/Contract address: (0x[a-fA-F0-9]{40})/);
    
    if (addressMatch) {
      const contractAddress = addressMatch[1];
      console.log(`✅ Contract deployed at: ${contractAddress}`);
      
      // Update environment files
      updateEnvironmentFiles(contractAddress);
      return contractAddress;
    } else {
      throw new Error('Could not extract contract address from deployment output');
    }
  } catch (error) {
    console.error('❌ Contract deployment failed:', error.message);
    throw error;
  }
}

function updateEnvironmentFiles(contractAddress) {
  console.log('📝 Updating environment files...');
  
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

async function killExistingProcesses() {
  console.log('🧹 Cleaning up existing processes...');
  
  try {
    const { execSync } = require('child_process');
    const os = require('os');
    
    if (os.platform() === 'win32') {
      // Windows - kill process on port 8545
      try {
        const result = execSync('netstat -ano | findstr :8545', { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.includes('LISTENING'));
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            console.log(`🔪 Killing existing process ${pid} on port 8545`);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          }
        }
      } catch (error) {
        // No process found, which is fine
      }
    } else {
      // Unix/Linux/macOS
      try {
        const result = execSync('lsof -ti:8545', { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(pid => pid);
        
        for (const pid of pids) {
          console.log(`🔪 Killing existing process ${pid} on port 8545`);
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
      } catch (error) {
        // No process found, which is fine
      }
    }
    
    console.log('✅ Port cleanup complete');
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.log('ℹ️  No existing processes to clean up');
  }
}

async function main() {
  try {
    console.log('📋 Setup Steps:');
    console.log('1. Clean up existing processes');
    console.log('2. Start Hardhat local node');
    console.log('3. Deploy smart contract');
    console.log('4. Update environment files');
    console.log('');
    
    // Step 1: Clean up existing processes
    await killExistingProcesses();
    
    // Step 2: Start Hardhat node
    await startHardhatNode();
    
    // Step 2: Deploy contract
    const contractAddress = await deployContract();
    
    console.log('\n' + '🎉'.repeat(20));
    console.log('✅ LOCAL DEVELOPMENT SETUP COMPLETE!');
    console.log('🎉'.repeat(20));
    console.log('\n📋 What\'s ready:');
    console.log('🔗 Hardhat Node: http://localhost:8545');
    console.log(`📜 Contract Address: ${contractAddress}`);
    console.log('\n📋 Next steps:');
    console.log('1. Open a new terminal');
    console.log('2. Run: pnpm run dev:backend');
    console.log('3. Open another terminal');
    console.log('4. Run: pnpm run dev:frontend');
    console.log('\n💡 Press Ctrl+C to stop the Hardhat node');
    
    // Keep the Hardhat node running
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    cleanup();
    process.exit(1);
  }
}

main();