# 🔗 Blockchain IT Asset Manager

A complete blockchain solution for secure IT equipment recycling with immutable proof of data sanitization.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Hardhat and blockchain dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# Install frontend dependencies (if not already installed)
npm install ethers
```

### 2. Setup Environment
Create a `.env` file in your project root:
```env
# Private key for deployment (DO NOT commit this)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Compile Contracts
```bash
npx hardhat compile
```

### 4. Deploy Contract

**Local Development:**
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

**Testnet Deployment:**
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

### 5. Update Frontend Configuration
After deployment, update the contract address in `client/lib/blockchain.ts`:
```typescript
const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address
```

## 📋 Smart Contract Features

### Core Functions

1. **registerAsset(serialNumber, model)** - Register new IT equipment
2. **proveSanitization(assetId, wipeLogHash)** - Prove secure data wiping
3. **recycleAsset(assetId)** - Mark asset as recycled (awards carbon credits)
4. **transferAsset(assetId, newOwner)** - Transfer ownership for resale
5. **getAssetHistory(assetId)** - Get complete asset lifecycle

### Asset Lifecycle

```
REGISTERED → SANITIZED → RECYCLED → SOLD
     ↓           ↓          ↓        ↓
  Initial    Wipe Proof  +10 Carbon  Transfer
 Registration   Stored   Credits    Ownership
```

### Events Emitted

- `AssetRegistered` - New asset added to system
- `AssetSanitized` - Sanitization proof recorded
- `AssetRecycled` - Asset recycled, carbon credits awarded
- `AssetTransferred` - Ownership transferred

## 🔧 Frontend Integration

### Basic Usage Example

```typescript
import { useBlockchain } from '@/hooks/useBlockchain';

function MyComponent() {
  const { 
    wallet, 
    connectWallet, 
    registerAsset, 
    proveSanitization,
    getAssetHistory 
  } = useBlockchain();

  // Connect wallet
  const handleConnect = async () => {
    await connectWallet();
  };

  // Register new asset
  const handleRegister = async () => 
{
    const result = await registerAsset("SERIAL123", "Dell OptiPlex");
    if (result) {
      console.log(`Asset registered with ID: ${result.assetId}`);
    }
  };

  // Prove sanitization
  const handleSanitization = async (assetId: bigint) => {
    const wipeHash = "QmX..."; // IPFS hash of wipe log
    const txHash = await proveSanitization(assetId, wipeHash);
    if (txHash) {
      console.log(`Sanitization proved: ${txHash}`);