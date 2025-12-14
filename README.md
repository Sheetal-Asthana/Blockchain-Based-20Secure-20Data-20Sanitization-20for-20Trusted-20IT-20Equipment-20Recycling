# SanitizeChain Platform

A blockchain-based secure data sanitization platform with separate frontend, backend, and smart contract services.

## Architecture

```
sanitizechain-platform/
├── frontend/          # React frontend (port 3000)
├── backend/           # Express API server (port 5000)  
├── blockchain/        # Smart contracts (port 8545)
└── shared/           # Shared types and utilities
```

## Services

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS (Port 3000)
- **Backend**: Express + TypeScript + MongoDB (Port 5000)
- **Blockchain**: Hardhat + Solidity (Port 8545)
- **Database**: MongoDB (Port 27017)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB (or use Docker)

### 1. Install Dependencies
```bash
pnpm run install:all
```

### 2. Environment Setup
Copy environment files and configure:
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend  
cp backend/.env.example backend/.env

# Blockchain
cp blockchain/.env.example blockchain/.env
```

### 3. Start All Services
```bash
# Development mode (all services)
pnpm dev

# Or start individually:
pnpm run dev:blockchain  # Start blockchain node
pnpm run dev:backend     # Start API server
pnpm run dev:frontend    # Start React app
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Blockchain RPC**: http://localhost:8545

## Development Commands

```bash
# Install all dependencies
pnpm run install:all

# Development (all services)
pnpm dev

# Individual services
pnpm run dev:frontend    # React app
pnpm run dev:backend     # API server
pnpm run dev:blockchain  # Hardhat node

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Clean all node_modules
pnpm run clean
```

## Docker Setup

Start all services with Docker:
```bash
docker-compose up -d
```

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SanitizeChain Platform
VITE_BLOCKCHAIN_NETWORK=localhost
VITE_ENABLE_BLOCKCHAIN=true
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sanitizechain
JWT_SECRET=your-secret-key
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=your-contract-address
FRONTEND_URL=http://localhost:3000
```

### Blockchain (.env)
```
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-key
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/ping` - Simple ping
- `POST /api/auth/login` - User authentication
- `GET /api/assets` - Asset management
- `GET /api/blockchain/status` - Blockchain status

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Route components
│   ├── contexts/      # React contexts
│   └── utils/         # Utilities
├── package.json
└── vite.config.ts

backend/
├── src/
│   ├── routes/        # API routes
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   └── config/        # Configuration
├── package.json
└── tsconfig.json

blockchain/
├── contracts/         # Solidity contracts
├── scripts/          # Deployment scripts
├── test/             # Contract tests
├── package.json
└── hardhat.config.js

shared/
├── types.ts          # Shared TypeScript types
└── api.ts           # API interfaces
```

## Deployment

Each service can be deployed independently:

- **Frontend**: Netlify, Vercel, or static hosting
- **Backend**: Railway, Render, or any Node.js hosting
- **Blockchain**: Deploy contracts to Ethereum, Polygon, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate service directory
4. Test all services work together
5. Submit a pull request