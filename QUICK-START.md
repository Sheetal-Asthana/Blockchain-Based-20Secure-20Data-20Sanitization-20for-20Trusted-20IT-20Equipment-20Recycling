# 🚀 Quick Start Guide - Blockchain IT Asset Manager

## ✅ What's Already Done
- ✅ Smart contract created (`contracts/ITAssetManager.sol`)
- ✅ Deployment script ready (`scripts/deploy.js`)
- ✅ Frontend integration complete
- ✅ Dependencies installed
- ✅ UI components created

## 🔑 What You Need (5 minutes setup)

### 1. Get Free API Keys

**Infura (Required - 2 minutes):**
1. Go to [infura.io](https://infura.io) → Sign up (free)
2. Create new project → Copy Project ID
3. Your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**Etherscan (Optional - 1 minute):**
1. Go to [etherscan.io](https://etherscan.io) → Sign up
2. API Keys → Create new key

### 2. Setup Environment File

Create `.env` in project root:

```env
# Replace YOUR_PROJECT_ID with actual Infura project ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_key_optional
```

### 3. Get MetaMask Private Key
1. Open MetaMask → Click account → Account Details
2. Export Private Key → Copy (without 0x prefix)
3. Add to `.env` file

## 🚀 Launch Steps (3 commands)

### Step 1: Compile Contract
```bash
npx hardhat compile
```

### Step 2: Deploy to Local Network
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### Step 3: Update Contract Address
After deployment, copy the contract address and update `client/lib/blockchain.ts`:
```typescript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your address
```

### Step 4: Start Frontend
```bash
pnpm dev
```

## 🎯 Test the App

1. **Open**: `http://localhost:3000/blockchain`
2. **Connect MetaMask**: Add local network (Chain ID: 31337, RPC: http://127.0.0.1:8545)
3. **Register Asset**: Serial number + model
4. **Search Asset**: Use ID from registration
5. **Prove Sanitization**: Add any hash (e.g., "QmTest123")
6. **Recycle**: Earn 10 carbon credits
7. **Transfer**: Send to another address

## 🌐 Deploy to Testnet (Optional)

### Get Test ETH:
- Sepolia: [sepoliafaucet.com](https://sepoliafaucet.com)

### Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔧 Troubleshooting

**"Cannot find module 'ethers'"** → Already fixed ✅

**"Network not supported"** → Add network to MetaMask:
- Network: Hardhat Local
- RPC: http://127.0.0.1:8545  
- Chain ID: 31337

**"Insufficient funds"** → Use local network first (free ETH)

**"Contract not found"** → Update CONTRACT_ADDRESS in blockchain.ts

## 📱 Navigation

Add blockchain link to your sidebar by updating `client/components/Sidebar.tsx`:

```typescript
// Add this to your navigation items
{
  title: "Blockchain",
  url: "/blockchain",
  icon: Shield,
}
```

## 🎉 Success Checklist

- [ ] Contract compiles without errors
- [ ] Local deployment works
- [ ] MetaMask connects
- [ ] Can register assets
- [ ] Can prove sanitization
- [ ] Can recycle assets
- [ ] Events show in console

**You're ready to demo your blockchain-powered IT asset recycling system!** 🚀