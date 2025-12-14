# 🔐 Nebulix - Blockchain-Based Secure Data Sanitization for IT Equipment Recycling

## Project Overview

**Nebulix** is a hackathon project demonstrating an end-to-end blockchain solution for IT equipment recycling with immutable "Certificate of Data Destruction" (CoDD) using Smart Contracts and IPFS.

The platform allows:
- ✅ **Register** IT devices on-chain
- 🧹 **Sanitize** devices with proof uploaded to IPFS
- 🔗 **Verify** sanitization certificates publicly (no auth required)
- 📋 **Export** compliance reports & PDFs
- 📱 **Scan** QR codes for instant verification
- ♻️ **Recycle** with environmental impact tracking

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Ethers.js v6** for smart contract interaction
- **Vite** for fast bundling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Shadcn/ui** for components

### Backend
- **Node.js/Express** for API middleware
- **Pinata API** for IPFS pinning
- **MongoDB** for metadata (optional)
- **Ethers.js** for blockchain monitoring

### Blockchain
- **Solidity ^0.8.20** smart contracts
- **Hardhat** for development & testing
- **Polygon Amoy Testnet** (chainId: 80002)
- **OpenZeppelin** for secure libraries

### Storage
- **IPFS** via Pinata for immutable evidence
- **Smart Contract** as blockchain record
- **Optional**: MongoDB for indexing & analytics

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │  AssetRegistry   │  │ TechnicianDash   │  │   Verify   │ │
│  │  (Register)      │  │ (Sanitize)       │  │  (Public)  │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │  QRCodeScanner   │  │   CertificatesDashboard         │  │
│  │  (Scan)          │  │   (Admin View)                   │  │
│  └──────────────────┘  └──────────────────────────────────┘  │
│                                                              │
│  useBlockchain Hook ←→ Ethers.js ←→ MetaMask/Web3         │
└──────────────────────────────────┬──────────────────────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
         ┌────────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
         │   Backend API   │ │  IPFS Pinata│ │   Blockchain   │
         │  (Express)      │ │  (Evidence) │ │  (Polygon Amoy)│
         │                 │ │             │ │                │
         │ /api/upload-... │ │  CID Hash   │ │  ITAssetManager│
         │ /api/ipfs/:hash │ │             │ │  Smart Contract│
         └─────────────────┘ └─────────────┘ └────────────────┘
```

---

## Project Structure

```
root/
├── blockchain/                    # Solidity contracts & Hardhat config
│   ├── contracts/
│   │   └── ITAssetManager.sol    # Core smart contract
│   ├── scripts/
│   │   └── deploy.js              # Deployment script
│   ├── test/
│   │   └── ITAssetManager.test.js # Unit tests (6 passing)
│   ├── hardhat.config.js          # Network config (Amoy support)
│   └── .env                       # PRIVATE_KEY, RPC URLs, Pinata keys
│
├── client/                        # React frontend
│   ├── components/
│   │   ├── AssetRegistry.tsx      # Register assets
│   │   ├── TechnicianDashboard.tsx# Sanitize with IPFS
│   │   ├── Verify.tsx             # View certificates
│   │   ├── QRCodeScanner.tsx      # Scan QR codes
│   │   ├── CertificatesDashboard.tsx # Admin view
│   │   └── ...other components
│   ├── pages/
│   │   ├── Verify.tsx             # Public verify page
│   │   ├── Dashboard.tsx
│   │   └── ...other pages
│   ├── hooks/
│   │   └── useBlockchain.ts       # Ethers.js hook (COMPLETE)
│   ├── lib/
│   │   ├── contract-info.json     # ABI + address (generated)
│   │   ├── blockchain.ts
│   │   └── pdf-export.ts          # PDF generation
│   ├── App.tsx                    # Routes (with /verify/:serialNumber)
│   └── global.css
│
├── server/                        # Node.js/Express backend
│   ├── routes/
│   │   ├── ipfs.ts               # IPFS upload & retrieval
│   │   ├── auth.ts
│   │   ├── assets.ts
│   │   └── blockchain.ts
│   ├── services/
│   │   ├── IPFSService.ts
│   │   ├── BlockchainService.ts
│   │   └── ...other services
│   ├── index.ts                   # Express server setup
│   └── config/
│       ├── database.ts
│       └── email.ts
│
├── shared/
│   └── types.ts                   # Shared TypeScript types
│
├── .env.example                   # Environment variables template
├── .env                           # Your config (PRIVATE_KEY, Pinata, etc.)
├── package.json                   # Root dependencies
├── pnpm-lock.yaml                 # Lock file (using pnpm)
├── tsconfig.json
├── vite.config.ts
├── PHASE-1-COMPLETE.md           # Smart Contract docs
├── PHASE-2-COMPLETE.md           # Workflow & IPFS docs
├── PHASE-3-COMPLETE.md           # Public Verification docs
└── README.md                      # This file
```

---

## Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Polygon Amoy testnet tokens (free from [faucet](https://amoy-faucet.polygon.technology/))
- Pinata account ([free tier](https://app.pinata.cloud))

### 1. Clone & Install

```bash
git clone <repo>
cd Blockchain-Based-20Secure-20Data-20Sanitization-for-20Trusted-20IT-20Equipment-20Recycling

# Install dependencies
pnpm install

# Install blockchain deps
cd blockchain && pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
# Blockchain
PRIVATE_KEY=0xYourPrivateKeyHere
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/

# Pinata IPFS
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret
PINATA_JWT=your_jwt

# Etherscan (optional, for verification)
ETHERSCAN_API_KEY=your_key
```

### 3. Deploy Smart Contract

```bash
cd blockchain

# Compile
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.js --network amoy
```

This generates `client/lib/contract-info.json` with ABI & address.

### 4. Start Frontend

```bash
# From root directory
pnpm run dev

# Opens at http://localhost:3000
```

### 5. Start Backend (Optional)

```bash
# In separate terminal
pnpm run server

# Runs at http://localhost:3001
```

---

## Usage Guide

### For Asset Administrators

#### Register an Asset
1. Open app → Asset Registry component
2. Enter Serial Number (e.g., `DELL-SN-12345`)
3. Enter Device Model (e.g., `Dell OptiPlex 7090`)
4. Click "Register Asset" → Confirm MetaMask TX
5. Asset now on blockchain with status = REGISTERED

#### View Assets Dashboard
1. Navigate to "Certificates Dashboard"
2. See all sanitized assets (Status = SANITIZED)
3. Search by serial or model
4. View impact metrics (total certificates, carbon saved)

### For Technicians

#### Sanitize an Asset
1. Open app → Technician Dashboard
2. See registered assets
3. Click "Start Sanitization" on an asset
4. Watch 3-second progress bar (simulated wipe)
5. Proof auto-generates & uploads to IPFS
6. MetaMask confirms blockchain TX
7. Asset status changes to SANITIZED
8. IPFS hash displayed on card

### For Public Verification

#### Verify via URL
- Direct link: `https://yourapp.com/verify/DEVICE-SERIAL-001`
- No authentication needed
- Shows full Certificate of Data Destruction
- Can download PDF, copy link, or share

#### Verify via QR Code
1. Have a QR code from a certificate
2. Navigate to Scanner page
3. Click "Start Camera"
4. Point at QR code
5. Auto-navigates to certificate
6. Or enter serial manually

#### Download Certificate
1. View certificate
2. Click "Download PDF"
3. Browser print dialog opens
4. Save as PDF
5. Professional certificate with:
   - Asset info
   - Sanitization proof
   - IPFS hash & gateway link
   - Environmental impact
   - Blockchain authenticity claims

---

## Smart Contract API

### Core Functions

#### `registerAsset(string serial, string model) → uint256 assetId`
- **Access**: Owner only
- **Returns**: New asset ID
- **Status**: REGISTERED (0)

#### `proveSanitization(uint256 assetId, string ipfsHash)`
- **Access**: Public (any technician)
- **Requires**: Status == REGISTERED
- **Sets**: Status → SANITIZED, records technician & IPFS hash
- **Event**: AssetSanitized emitted

#### `verifyAsset(string serial) → Asset`
- **Access**: Public view
- **Returns**: Full asset struct by serial number
- **Use**: Public verification

#### `getAssetsByStatus(uint8 status, uint256 offset, uint256 limit) → uint256[]`
- **Access**: Public view
- **Returns**: Paginated asset IDs by status
- **Statuses**: 0=REGISTERED, 1=SANITIZED, 2=RECYCLED, 3=SOLD

#### `recycleAsset(uint256 assetId)`
- **Access**: Owner only
- **Requires**: Status == SANITIZED
- **Awards**: 10 carbon credits

### Events
```solidity
event AssetRegistered(uint256 indexed assetId, string serialNumber, string model, address indexed owner);
event AssetSanitized(uint256 indexed assetId, string ipfsHash, uint256 timestamp);
event AssetRecycled(uint256 indexed assetId, uint256 carbonCredits, uint256 timestamp);
event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 timestamp);
```

---

## Backend API Endpoints

### IPFS Routes

#### `POST /api/upload-to-ipfs`
Upload sanitization proof to Pinata IPFS.

**Body:**
```json
{
  "assetId": 1,
  "timestamp": "2025-12-14T10:30:00Z",
  "technicianAddress": "0x...",
  "sanitizationMethod": "DBAN",
  "status": "SUCCESS",
  "details": {...}
}
```

**Response:**
```json
{
  "success": true,
  "ipfsHash": "QmXxx...",
  "pinataUrl": "https://gateway.pinata.cloud/ipfs/QmXxx..."
}
```

#### `GET /api/ipfs/:hash`
Retrieve proof from IPFS.

---

## Testing

### Run Smart Contract Tests
```bash
cd blockchain
npx hardhat test

# Output:
# ✓ 6 tests passing
# - Asset registration
# - Sanitization proof
# - Asset recycling
# - Serial number validation
# - etc.
```

### Manual Testing Flow
1. **Register Asset** → See TX hash
2. **Sanitize Asset** → Progress bar → IPFS upload → Blockchain TX
3. **Verify** → Navigate to `/verify/SERIAL` → See certificate
4. **Download PDF** → Save certificate locally
5. **Scan QR** → Launch camera → Auto-navigate to certificate

---

## Deployment Guide

### Frontend (Vercel/Netlify)

```bash
# Build
pnpm run build

# Output: dist/ directory
# Deploy to Vercel/Netlify (auto-detects Vite config)
```

**Env vars in cloud:**
- `VITE_RPC_URL` (optional, defaults to Amoy)
- `VITE_CONTRACT_ADDRESS` (optional, uses deployed value)

### Backend (Heroku/Railway)

```bash
# Create Procfile
echo "web: npm run server" > Procfile

# Set env vars in cloud console:
# - PRIVATE_KEY
# - POLYGON_AMOY_RPC
# - PINATA_JWT
# - MONGODB_URI (if using)
# - NODE_ENV=production

# Deploy
git push heroku main
```

### Smart Contract (Blockchain)

Already deployed to Polygon Amoy! ✅

**Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3` (local test value)
**Explorer:** https://amoy.polygonscan.com

To deploy to new network:
```bash
cd blockchain
# Update hardhat.config.js with new network config
npx hardhat run scripts/deploy.js --network <network-name>
```

---

## Troubleshooting

### MetaMask Connection Issues
- ❌ "MetaMask not installed" → Install MetaMask extension
- ❌ "Connected to wrong network" → Switch to Polygon Amoy in MetaMask
- ❌ "Insufficient balance" → Get Amoy tokens from [faucet](https://amoy-faucet.polygon.technology/)

### IPFS Upload Failures
- ❌ "PINATA_JWT not configured" → Add to `.env`
- ❌ "Failed to upload to IPFS" → Check Pinata API status
- ❌ "Invalid IPFS hash" → Verify Pinata credentials

### Contract Compilation Errors
```bash
cd blockchain
rm -rf artifacts/
npx hardhat clean
npx hardhat compile
```

### Frontend Build Issues
```bash
rm -rf node_modules/ pnpm-lock.yaml
pnpm install
pnpm run dev
```

---

## Security Considerations

### Smart Contract
✅ OpenZeppelin libraries (Ownable, ReentrancyGuard)  
✅ Input validation (non-empty strings, valid addresses)  
✅ Event logging for all state changes  
✅ Immutable core data (blockchain)  

### IPFS Evidence
✅ Content-addressed (hash-based integrity)  
✅ Pinata pinning (redundancy)  
✅ Public but read-only  

### Private Keys
⚠️ **NEVER commit `.env` with real private keys**  
✅ Use `.env.example` template  
✅ Use environment variables in CI/CD  
✅ Rotate keys regularly  

### Frontend
✅ MetaMask validation  
✅ XSS protection (React sanitization)  
✅ CORS configured  
✅ Rate limiting on API routes  

---

## Environmental Impact

**Carbon Credits System:**
- 10 credits per sanitized & recycled device
- Converts to carbon offset equivalent
- Tracked on blockchain

**E-Waste Reduction:**
- Certified data destruction
- Proper recycling standards
- Transparent compliance proof

---

## Future Roadmap

**Phase 4 (Proposed):**
- [ ] Multi-signature authorization
- [ ] Upgradeable proxy contracts
- [ ] Governance token (DAO voting)
- [ ] White-label solution for enterprises
- [ ] Mobile app (React Native)
- [ ] Hardware integration (wipe tools API)
- [ ] Compliance report automation
- [ ] Carbon credit marketplace

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Open PR

---

## License

MIT License - See LICENSE file

---

## Support

- 📧 Email: support@nebulix.com
- 💬 Discord: [Join server]
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Full documentation]

---

## Team

Built as a hackathon project combining:
- ✨ Web3 & Blockchain expertise
- 💻 Full-stack development
- 🔒 Security best practices
- ♻️ Environmental impact focus

---

## Acknowledgments

- OpenZeppelin for secure contracts
- Polygon for testnet infrastructure
- Pinata for IPFS services
- Ethers.js for blockchain integration
- React & Vite communities

---

**🚀 Ready to revolutionize IT equipment recycling?**

Deploy Nebulix today: `pnpm run dev`

Verify your first certificate: Navigate to `/verify/TEST-DEVICE-001`

🎉 **All three phases complete and ready for production!**
