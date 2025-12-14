# 🚀 Demo Setup Guide

This guide will help you set up and run the complete blockchain-based IT Asset Management demo.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **PNPM** package manager
3. **MetaMask** browser extension
4. **Git** for cloning

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
# Install main project dependencies
pnpm install

# Install blockchain dependencies
cd blockchain
pnpm install
cd ..
```

### 2. Environment Configuration

Create environment files:

```bash
# Copy environment templates
cp .env.example .env
cp blockchain/.env.example blockchain/.env
```

Edit `.env` files with your configuration:

**Root `.env`:**
```env
# Blockchain Configuration
ENABLE_BLOCKCHAIN=true
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# IPFS/Pinata Configuration (Optional for demo)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**Blockchain `.env`:**
```env
# For local development
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# For Polygon Amoy testnet (optional)
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
cd blockchain
pnpm run node
```

Keep this terminal running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### 4. Deploy Smart Contract

```bash
# Terminal 2: Deploy contract
cd blockchain
pnpm run deploy:local
```

You should see output like:
```
ITAssetManager deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 5. Start the Application

```bash
# Terminal 3: Start the web application
pnpm dev
```

The application will be available at: http://localhost:8080

## 🎭 Demo Flow

### Step 1: Corporate Registration
1. Go to http://localhost:8080
2. Click "Corporate Dashboard"
3. Connect MetaMask wallet (use Account #0 from Hardhat)
4. Register asset: Serial: `DELL-XP-900`, Model: `XPS 15`
5. Confirm transaction in MetaMask

### Step 2: Technician Sanitization
1. Go to http://localhost:8080/technician
2. You'll see the registered asset in "Pending Sanitization"
3. Click "Sanitize Device" on `DELL-XP-900`
4. Watch the progress: Wiping → Uploading → Minting
5. Confirm the blockchain transaction in MetaMask

### Step 3: Public Verification
1. Go to http://localhost:8080/verify/1 (or the asset ID from step 1)
2. View the Certificate of Data Destruction
3. See the complete timeline and IPFS evidence hash
4. Note the "Sanitized" status and carbon credits

## 🔗 MetaMask Setup

### Add Hardhat Network to MetaMask:
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### Import Test Account:
Use the first private key from Hardhat:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 🌐 Polygon Amoy Testnet (Optional)

To deploy on Polygon Amoy testnet:

1. Get MATIC tokens from [Polygon Faucet](https://faucet.polygon.technology/)
2. Update `blockchain/.env` with your private key and RPC URL
3. Deploy: `cd blockchain && pnpm run deploy:amoy`
4. Update contract address in client configuration

### Add Polygon Amoy to MetaMask:
- **Network Name:** Polygon Amoy Testnet
- **RPC URL:** https://rpc-amoy.polygon.technology/
- **Chain ID:** 80002
- **Currency Symbol:** MATIC
- **Block Explorer:** https://amoy.polygonscan.com/

## 🎯 Demo Script

### For Live Presentation:

**"Step 1: Corporate Registration"**
- "I'm a corporate admin at Bank of America"
- "I need to register a laptop for secure recycling"
- "Serial: DELL-XP-900, Model: XPS 15"
- "This creates an immutable blockchain record"

**"Step 2: Technician Action"**
- "Now I'm a recycling center technician"
- "I see the pending device in my queue"
- "I click 'Sanitize Device' to start the secure wipe"
- "The system simulates: data wiping → evidence upload → certificate minting"

**"Step 3: Public Verification"**
- "Anyone can verify this certificate"
- "Scan QR code or visit /verify/1"
- "See complete history, IPFS evidence, and carbon credits"
- "This is cryptographically secured and cannot be forged"

## 🔍 Key Features Demonstrated

✅ **Blockchain Registration** - Immutable asset records
✅ **Wipe Simulation** - Realistic sanitization process
✅ **IPFS Evidence** - Decentralized proof storage
✅ **Public Verification** - Trustless certificate validation
✅ **Carbon Credits** - ESG compliance tracking
✅ **Real-time Updates** - Live blockchain integration

## 🛠️ Troubleshooting

### Common Issues:

**MetaMask not connecting:**
- Ensure you're on the correct network (Hardhat Local)
- Try refreshing the page
- Check browser console for errors

**Contract not found:**
- Verify the contract address in `.env`
- Ensure Hardhat node is running
- Redeploy the contract if needed

**Transaction failures:**
- Check you have enough ETH for gas
- Ensure you're using the contract owner account
- Try increasing gas limit in MetaMask

### Reset Demo:
```bash
# Stop all processes (Ctrl+C)
# Restart Hardhat node
cd blockchain
pnpm run node

# Redeploy contract
pnpm run deploy:local

# Restart application
cd ..
pnpm dev
```

## 📊 Success Metrics

After completing the demo, you should have:
- ✅ Asset registered on blockchain
- ✅ Sanitization proof recorded
- ✅ Public certificate accessible
- ✅ Carbon credits awarded
- ✅ Complete audit trail visible

## 🎉 Next Steps

- Deploy to Polygon Amoy testnet for persistent demo
- Add QR code generation for certificates
- Integrate real IPFS file uploads
- Add bulk operations for enterprise use
- Implement role-based access control

This demo showcases a complete blockchain-based solution for IT asset recycling with cryptographic proof of data sanitization!