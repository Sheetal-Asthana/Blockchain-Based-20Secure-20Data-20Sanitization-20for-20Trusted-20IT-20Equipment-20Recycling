#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying contract to local Hardhat network...');

try {
  // Change to blockchain directory and deploy
  process.chdir(path.join(__dirname, 'blockchain'));
  
  console.log('📜 Deploying smart contract...');
  const output = execSync('npx hardhat run scripts/deploy.js --network localhost', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log(output);
  
  // Extract contract address from output
  const addressMatch = output.match(/Contract address: (0x[a-fA-F0-9]{40})/);
  
  if (addressMatch) {
    const contractAddress = addressMatch[1];
    console.log(`✅ Contract deployed at: ${contractAddress}`);
    
    // Update environment files
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    const rootEnvPath = path.join(__dirname, '.env');
    
    // Update backend .env
    if (fs.existsSync(backendEnvPath)) {
      let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
      backendEnv = backendEnv.replace(/CONTRACT_ADDRESS=".*"/, `CONTRACT_ADDRESS="${contractAddress}"`);
      fs.writeFileSync(backendEnvPath, backendEnv);
      console.log('✅ Updated backend/.env');
    }
    
    // Update root .env
    if (fs.existsSync(rootEnvPath)) {
      let rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
      rootEnv = rootEnv.replace(/CONTRACT_ADDRESS=".*"/, `CONTRACT_ADDRESS="${contractAddress}"`);
      fs.writeFileSync(rootEnvPath, rootEnv);
      console.log('✅ Updated .env');
    }
    
    console.log('🎉 Deployment complete! You can now start the backend and frontend.');
    
  } else {
    console.error('❌ Could not extract contract address from deployment output');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}