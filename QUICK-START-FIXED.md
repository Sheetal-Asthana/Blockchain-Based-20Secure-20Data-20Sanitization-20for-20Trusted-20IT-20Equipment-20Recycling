# 🚀 SanitizeChain - Quick Start Guide

## Fixed Issues ✅

- **JSON Parsing Error**: Fixed API URL construction (was calling `/api/api/...`)
- **Blockchain Integration**: Added proper local Hardhat node connection
- **Environment Configuration**: Standardized ports and URLs across services
- **Contract Deployment**: Automated deployment and environment updates
- **CORS Issues**: Fixed frontend-backend communication

## Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or cloud)
- Git

## 🎯 One-Command Setup

```bash
# Clone and setup everything
git clone <your-repo>
cd sanitizechain-platform

# Install all dependencies
pnpm install:all

# Setup local blockchain and deploy contract (automated)
pnpm run setup:local
```

**Keep the first terminal open** (Hardhat node running), then open **2 new terminals**:

```bash
# Terminal 2: Start backend
pnpm run dev:backend

# Terminal 3: Start frontend
pnpm run dev:frontend
```

## 🧪 Verify Everything Works

```bash
# Test all integrations
pnpm run test:integration
```

## 📋 Service URLs

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Hardhat Blockchain**: http://localhost:8545
- **API Documentation**: http://localhost:5000/api/health

## 🎮 Test the Platform

1. **Open Frontend**: http://localhost:5173
2. **Register/Login**: Create an account or use existing credentials
3. **Register Asset**: Add a new IT device to the blockchain
4. **Sanitize**: Upload a sanitization log file
5. **Recycle**: Mark the asset as recycled
6. **Verify**: Check the blockchain transaction history

## 🔧 Manual Setup (Alternative)

If the automated setup doesn't work:

```bash
# 1. Install dependencies
pnpm install:all

# 2. Start Hardhat node (Terminal 1 - keep open)
cd blockchain
pnpm run node

# 3. Deploy contract (Terminal 2)
cd ..
pnpm run deploy:local

# 4. Start backend (Terminal 2)
pnpm run dev:backend

# 5. Start frontend (Terminal 3)
pnpm run dev:frontend
```

## 🐛 Troubleshooting

### "Failed to load dashboard data"
- ✅ **Fixed**: API URLs now correctly point to backend
- Ensure backend is running on port 5000
- Check MongoDB connection

### "Contract address not set"
- ✅ **Fixed**: Automated deployment updates environment files
- Run `pnpm run deploy:local` if needed

### "Blockchain service not available"
- ✅ **Fixed**: Proper local Hardhat node integration
- Ensure Hardhat node is running on port 8545
- Check contract deployment was successful

### CORS Errors
- ✅ **Fixed**: Proper CORS configuration for local development
- Backend allows frontend origin (localhost:5173)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React)       │◄──►│   (Express)     │◄──►│   (Hardhat)     │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 8545    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TailwindCSS   │    │    MongoDB      │    │  Smart Contract │
│   Radix UI      │    │    Database     │    │   (Solidity)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📚 Key Features Working

- ✅ **Asset Registration**: Register IT devices on blockchain
- ✅ **Sanitization Proof**: Upload IPFS-backed sanitization logs
- ✅ **Recycling Tracking**: Carbon credit calculation
- ✅ **QR Code Generation**: Public verification links
- ✅ **Dashboard Analytics**: Real-time metrics
- ✅ **Bulk Operations**: CSV import/export
- ✅ **Audit Trail**: Complete blockchain history

## 🚀 Next Steps

1. **Customize**: Modify smart contracts in `blockchain/contracts/`
2. **Extend**: Add new API endpoints in `backend/src/routes/`
3. **Style**: Update UI components in `frontend/src/components/`
4. **Deploy**: Use production deployment guides

## 📞 Support

- Check `LOCAL-SETUP.md` for detailed setup instructions
- Review `DEPLOYMENT-GUIDE.md` for production deployment
- Run `pnpm run test:integration` to diagnose issues

---

**🎉 Your SanitizeChain platform is now ready for development!**