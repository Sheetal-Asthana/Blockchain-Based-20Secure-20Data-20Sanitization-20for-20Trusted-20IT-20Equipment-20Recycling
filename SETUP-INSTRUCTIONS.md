# SanitizeChain Platform - Setup Instructions

## 🚀 Quick Setup Guide

### 1. Install Dependencies
```bash
# Install root dependencies
pnpm install

# Install all service dependencies
pnpm run install:all
```

### 2. Environment Configuration

#### Frontend Environment
```bash
cd frontend
cp .env.example .env
```

#### Backend Environment  
```bash
cd backend
cp .env.example .env
# Edit backend/.env and set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a secure secret)
# - PINATA_JWT (your Pinata IPFS token)
```

#### Blockchain Environment
```bash
cd blockchain  
cp .env.example .env
# Edit blockchain/.env and set:
# - PRIVATE_KEY (for contract deployment)
```

### 3. Start Services

#### Option A: All Services at Once
```bash
# Start all services (recommended)
pnpm dev
```

#### Option B: Individual Services
```bash
# Terminal 1: Blockchain (must start first)
cd blockchain
pnpm run node

# Terminal 2: Backend (wait for blockchain)
cd backend
pnpm dev

# Terminal 3: Frontend (wait for backend)
cd frontend
pnpm dev
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Blockchain RPC**: http://localhost:8545

## 🔧 Service Details

### Frontend (Port 3000)
- React 18 + TypeScript + Vite
- TailwindCSS for styling
- Connects to backend API

### Backend (Port 5000)  
- Express + TypeScript
- MongoDB for data storage
- JWT authentication
- Blockchain integration

### Blockchain (Port 8545)
- Hardhat local network
- Smart contracts for asset management
- Automatic contract deployment

## 📋 Prerequisites

### Required
- Node.js 18+
- pnpm package manager
- MongoDB (local or cloud)

### Optional
- Docker & Docker Compose
- Pinata account (for IPFS)

## 🐳 Docker Setup (Alternative)

If you prefer Docker:
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 5000, 8545 are available
2. **MongoDB connection**: Ensure MongoDB is running and accessible
3. **Blockchain not starting**: Check if port 8545 is free

### Service Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# Blockchain status  
curl http://localhost:5000/api/blockchain/status

# Frontend (should show the home page)
curl http://localhost:3000
```

### Reset Everything
```bash
# Clean all node_modules and rebuild
pnpm run clean
pnpm run install:all
pnpm dev
```

## 📁 Project Structure

```
sanitizechain-platform/
├── frontend/              # React app (port 3000)
│   ├── src/
│   │   ├── pages/        # Route components
│   │   ├── components/   # React components  
│   │   └── lib/         # API client
│   └── package.json
├── backend/              # Express API (port 5000)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Database models
│   │   └── services/    # Business logic
│   └── package.json
├── blockchain/           # Smart contracts (port 8545)
│   ├── contracts/       # Solidity files
│   ├── scripts/        # Deployment scripts
│   └── package.json
└── shared/              # Shared types
    ├── types.ts
    └── api.ts
```

## 🎯 Next Steps

1. **Configure MongoDB**: Set up your database connection
2. **Deploy Contracts**: Run blockchain deployment scripts  
3. **Test Integration**: Verify all services communicate
4. **Add Features**: Start building your application logic

## 📞 Support

If you encounter issues:
1. Check the console logs for each service
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that required ports are available