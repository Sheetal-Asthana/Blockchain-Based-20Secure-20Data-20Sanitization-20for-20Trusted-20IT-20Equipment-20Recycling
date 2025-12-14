# 🚀 Complete Deployment Guide

## 📋 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React SPA)   │◄──►│   (Express)     │◄──►│   (Sepolia)     │
│   Port: 3000    │    │   Port: 3000    │    │   Smart Contract│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Database      │    │   IPFS Storage  │
│   (Vite Build)  │    │   (MongoDB)     │    │   (Pinata)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Environment Setup

### 1. Root Environment (.env)
```env
# Application
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__
PING_MESSAGE="ping pong"

# IPFS Storage
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Security
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRY=7d
BCRYPT_ROUNDS=12

# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,csv,json

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Feature Flags
ENABLE_BLOCKCHAIN=true
ENABLE_NOTIFICATIONS=true
ENABLE_AUDIT_LOG=true
ENABLE_BULK_OPERATIONS=true
ENABLE_MOBILE_APP=true

# Blockchain Integration (contract address only)
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Certificate Signing
CERTIFICATE_PRIVATE_KEY=your_certificate_private_key
CERTIFICATE_PUBLIC_KEY=your_certificate_public_key
```

### 2. Blockchain Environment (blockchain/.env)
```env
# Wallet Configuration
PRIVATE_KEY=your_metamask_private_key_without_0x

# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Development
REPORT_GAS=true
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
# Root dependencies
pnpm install

# Blockchain dependencies
pnpm run blockchain:setup
```

### Step 2: Generate Certificate Keys
```bash
node scripts/generate-certificate-keys.js
# Copy the output to your .env file
```

### Step 3: Deploy Smart Contract
```bash
# Deploy to Sepolia testnet
pnpm run blockchain:deploy:sepolia

# Copy the contract address to root .env
# CONTRACT_ADDRESS=0x...
```

### Step 4: Build Application
```bash
pnpm run build
```

### Step 5: Start Production Server
```bash
pnpm start
```

## 🔍 Verification Checklist

### ✅ Environment Variables
- [ ] All required .env variables set
- [ ] Certificate keys generated
- [ ] MetaMask private key added (blockchain/.env)
- [ ] Contract address updated (root .env)

### ✅ Blockchain Integration
- [ ] Smart contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] Blockchain service connects to contract
- [ ] Frontend shows "Connected" status

### ✅ Application Health
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] Database connection established
- [ ] File uploads work to IPFS

## 📊 API Endpoints

### Core Application
- `GET /api/health` - Health check
- `GET /api/ping` - Simple ping
- `POST /api/auth/login` - Authentication
- `GET /api/assets` - Asset management

### Blockchain Integration
- `GET /api/blockchain/status` - Blockchain connection status
- `GET /api/blockchain/assets/total` - Total assets on blockchain
- `GET /api/blockchain/assets/:id` - Get asset from blockchain
- `GET /api/blockchain/assets/check-serial/:serial` - Check serial number
- `GET /api/blockchain/assets/by-status/:status` - Assets by status

## 🛠️ Development Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm test                         # Run tests
pnpm typecheck                    # TypeScript validation

# Blockchain
pnpm run blockchain:compile       # Compile contracts
pnpm run blockchain:test          # Test contracts
pnpm run blockchain:node          # Local blockchain
pnpm run blockchain:deploy:local  # Deploy to local

# Production
pnpm build                        # Build for production
pnpm start                        # Start production server
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys regularly
- Use environment-specific RPC endpoints

### Smart Contract Security
- Contract is immutable after deployment
- Only owner can register/sanitize assets
- All transactions are public on blockchain
- Gas costs apply to all write operations

### API Security
- Rate limiting enabled
- CORS configured
- Helmet security headers
- Input validation on all endpoints

## 📈 Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check blockchain status
curl http://localhost:3000/api/blockchain/status
```

### Logs
- Application logs: Console output
- Blockchain logs: Etherscan transaction history
- Error tracking: Built-in error handlers

### Updates
- Frontend: Standard React deployment
- Backend: Node.js server restart
- Smart Contract: Requires new deployment (immutable)

## 🆘 Troubleshooting

### Common Issues

**Blockchain service unavailable:**
- Check CONTRACT_ADDRESS in .env
- Verify RPC endpoint is accessible
- Ensure contract is deployed correctly

**MetaMask connection issues:**
- Verify private key format (no 0x prefix)
- Check network configuration
- Ensure sufficient ETH for gas

**Build failures:**
- Run `pnpm install` to update dependencies
- Check TypeScript errors with `pnpm typecheck`
- Verify all environment variables are set

### Support Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Infura Support](https://docs.infura.io)
- [Pinata Documentation](https://docs.pinata.cloud)

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads and shows blockchain status as "Connected"
- ✅ All API endpoints return 200 status codes
- ✅ Smart contract is verified on Etherscan
- ✅ File uploads work to IPFS/Pinata
- ✅ Certificate generation works
- ✅ No console errors in browser or server logs

**Total setup time: 30-60 minutes for experienced developers**