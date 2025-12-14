# Local Development Setup

This guide will help you set up the complete SanitizeChain platform for local development with blockchain integration.

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Install dependencies
pnpm install:all

# Setup local blockchain and deploy contract
pnpm run setup:local
```

This will:
1. Start a local Hardhat node on port 8545
2. Deploy the smart contract
3. Update environment files with the contract address

Keep this terminal open (Hardhat node running), then in **new terminals**:

```bash
# Terminal 2: Start backend
pnpm run dev:backend

# Terminal 3: Start frontend  
pnpm run dev:frontend
```

### Option 2: Manual Setup

If you prefer to run each step manually:

```bash
# 1. Install dependencies
pnpm install:all

# 2. Start Hardhat node (keep running)
cd blockchain
pnpm run node

# 3. In a new terminal, deploy contract
pnpm run deploy:local

# 4. Start backend (new terminal)
pnpm run dev:backend

# 5. Start frontend (new terminal)
pnpm run dev:frontend
```

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Hardhat Node**: http://localhost:8545
- **MongoDB**: Your configured MongoDB URI

## Environment Configuration

The setup automatically configures:

- `CONTRACT_ADDRESS` in both `.env` and `backend/.env`
- Blockchain RPC URL pointing to local Hardhat node
- CORS settings for local development

## Testing the Integration

1. **Register an Asset**: Use the dashboard to register a new IT asset
2. **Sanitize**: Upload a sanitization log file to prove data wiping
3. **Recycle**: Mark the asset as recycled to earn carbon credits
4. **Verify**: Check the blockchain for asset history

## Troubleshooting

### "Contract address not set" error
- Make sure you ran the deployment step
- Check that `CONTRACT_ADDRESS` is set in your `.env` files

### "Failed to load dashboard data" error
- Ensure the backend is running on port 5000
- Check that MongoDB is connected
- Verify API endpoints are accessible

### Blockchain connection issues
- Ensure Hardhat node is running on port 8545
- Check that the contract was deployed successfully
- Verify the private key is configured

## Development Workflow

1. **Smart Contract Changes**: 
   - Modify contracts in `blockchain/contracts/`
   - Redeploy with `pnpm run deploy:local`

2. **Backend Changes**:
   - Edit files in `backend/src/`
   - Server auto-reloads with nodemon

3. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Vite provides hot module replacement

## Production Deployment

For production deployment, see:
- `DEPLOYMENT-GUIDE.md` - Complete production setup
- `README.md` - Project overview and architecture