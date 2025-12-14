# 🔑 External Requirements & API Keys

## 📋 Complete List of External Dependencies

### **🔐 Required API Keys & Accounts**

#### **1. Blockchain Infrastructure**
- **Infura Account** (FREE)
  - Website: [infura.io](https://infura.io)
  - Purpose: Ethereum/Polygon RPC endpoints
  - Required: `INFURA_PROJECT_ID`
  - Alternative: Alchemy, QuickNode

**🚀 STEP-BY-STEP INFURA SETUP (2 minutes):**
1. **Go to [infura.io](https://infura.io)**
2. **Click "Get started for free"**
3. **Sign up with email/password or GitHub**
4. **Verify your email address**
5. **Create your first project:**
   - Click "Create New API Key"
   - Choose "Web3 API (Ethereum, Polygon, etc.)"
   - Project Name: "IT Asset Manager"
   - Network: Select "Ethereum" and "Polygon PoS"
6. **Copy your Project ID:**
   - In project dashboard, find "PROJECT ID"
   - Copy the long string (looks like: `abc123def456...`)
   - This is your `INFURA_PROJECT_ID`
7. **Your RPC URLs will be:**
   - Ethereum Sepolia: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - Polygon Mumbai: `https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID`

- **Etherscan API** (FREE)
  - Website: [etherscan.io](https://etherscan.io)
  - Purpose: Contract verification
  - Required: `ETHERSCAN_API_KEY`
  - Alternative: Polygonscan for Polygon

#### **2. File Storage (IPFS)**
- **Pinata** (FREE tier available - RECOMMENDED)
  - Website: [pinata.cloud](https://pinata.cloud)
  - Purpose: Enterprise IPFS pinning service
  - Required: `PINATA_API_KEY`, `PINATA_SECRET_KEY`
  - Features: Dedicated gateways, analytics, better reliability
  - Alternative: Web3.Storage, Fleek

#### **3. Email Services**
- **SMTP Provider** (Choose one):
  - **Gmail SMTP** (FREE with limits)
    - Required: `SMTP_USER`, `SMTP_PASS`
  - **SendGrid** (FREE tier available)
    - Required: `SENDGRID_API_KEY`
  - **AWS SES** (Pay per use)
    - Required: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

#### **4. Notification Services (Optional)**
- **Slack Webhooks** (FREE)
  - Purpose: Team notifications
  - Required: `SLACK_WEBHOOK_URL`

- **Microsoft Teams Webhooks** (FREE)
  - Purpose: Team notifications
  - Required: `TEAMS_WEBHOOK_URL`

#### **5. Database (Choose one)**
- **MongoDB Atlas** (FREE tier)
  - Website: [mongodb.com/atlas](https://mongodb.com/atlas)
  - Required: `MONGODB_URI`

- **PostgreSQL** (Self-hosted or cloud)
  - Providers: Supabase, Railway, Neon
  - Required: `DATABASE_URL`

#### **6. Cloud Storage (Optional)**
- **AWS S3** or **Google Cloud Storage**
  - Purpose: File uploads, backups
  - Required: Cloud provider credentials

### **🛠️ Environment Variables Setup**

Create `.env` file in project root:

```env
# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

# Database
DATABASE_URL=mongodb://localhost:27017/itassets
# OR for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost:5432/itassets

# Blockchain
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
PRIVATE_KEY=your_wallet_private_key_without_0x
CONTRACT_ADDRESS=deployed_contract_address

# IPFS Storage (Pinata - Enterprise grade)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_GATEWAY_URL=https://gateway.pinata.cloud
# OR local IPFS:
# IPFS_HOST=localhost
# IPFS_PORT=5001
# IPFS_PROTOCOL=http

# Email (Choose one method)
# Method 1: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Method 2: SendGrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# Method 3: AWS SES
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# AWS_REGION=us-east-1

# Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=7d
BCRYPT_ROUNDS=12

# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,csv,json

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Features (Enable/Disable)
ENABLE_BLOCKCHAIN=true
ENABLE_NOTIFICATIONS=true
ENABLE_AUDIT_LOG=true
ENABLE_BULK_OPERATIONS=true
ENABLE_MOBILE_APP=true

# Certificate Signing (Optional)
CERTIFICATE_PRIVATE_KEY=your_certificate_signing_key
CERTIFICATE_PUBLIC_KEY=your_certificate_public_key
```

### **📦 Required NPM Packages**

All packages are already added to `package.json`. Install with:

```bash
pnpm install
```

**Key Dependencies:**
- `ethers` - Blockchain interaction
- `multer` - File uploads
- `nodemailer` - Email sending
- `jsonwebtoken` - Authentication
- `bcryptjs` - Password hashing
- `qrcode` - QR code generation
- `pdf-lib` - PDF generation
- `mongoose` or `prisma` - Database ORM
- `socket.io` - Real-time updates
- `winston` - Logging
- `helmet` - Security headers
- `compression` - Response compression

### **🚀 Deployment Requirements**

#### **1. Server Infrastructure**
- **Minimum Requirements:**
  - 2 CPU cores
  - 4GB RAM
  - 50GB SSD storage
  - Ubuntu 20.04+ or similar

- **Recommended Providers:**
  - DigitalOcean Droplets
  - AWS EC2
  - Google Cloud Compute
  - Linode
  - Vultr

#### **2. Domain & SSL**
- Domain name registration
- SSL certificate (Let's Encrypt FREE)
- DNS configuration

#### **3. Process Management**
- PM2 for Node.js process management
- Nginx for reverse proxy
- Firewall configuration (UFW)

### **💳 Cost Breakdown (Monthly)**

#### **FREE Tier (Development/Small Scale)**
- Infura: FREE (100K requests/day)
- Etherscan API: FREE (5 calls/sec)
- Pinata: FREE (1GB storage, 100 requests/month)
- Gmail SMTP: FREE (500 emails/day)
- MongoDB Atlas: FREE (512MB)
- **Total: $0/month**

#### **Production Tier (Medium Scale)**
- Server (DigitalOcean): $20/month
- Domain: $12/year (~$1/month)
- SendGrid: $15/month (40K emails)
- MongoDB Atlas: $9/month (2GB)
- Infura Pro: $50/month (unlimited)
- **Total: ~$95/month**

#### **Enterprise Tier (Large Scale)**
- Server Cluster: $200/month
- AWS SES: $10/month
- MongoDB Atlas: $57/month (10GB)
- CDN (CloudFlare): $20/month
- Monitoring: $30/month
- **Total: ~$317/month**

### **⚡ Quick Setup Commands**

#### **1. Get API Keys (5 minutes each)**
```bash
# Infura
1. Go to infura.io → Sign up → Create project → Copy Project ID

# Etherscan
2. Go to etherscan.io → Sign up → API Keys → Create key

# Pinata (RECOMMENDED)
3. Go to pinata.cloud → Sign up → API Keys → Create New Key
   - Give it a name: "IT Asset Manager"
   - Enable: pinFileToIPFS, pinByHash, pinList, userPinPolicy
   - Copy API Key and Secret Key

# Gmail App Password
4. Gmail → Security → 2FA → App Passwords → Generate
```

#### **2. Deploy Smart Contract**
```bash
cd blockchain
pnpm install
pnpm run compile
pnpm run deploy:sepolia  # or deploy:mumbai
# Copy contract address to .env
```

#### **3. Start Application**
```bash
pnpm install
pnpm run build
pnpm start
```

### **🔒 Security Checklist**

- [ ] Environment variables secured (never commit .env)
- [ ] Private keys encrypted/secured
- [ ] HTTPS enabled with valid SSL
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] CORS properly configured
- [ ] Authentication tokens secured
- [ ] File upload restrictions
- [ ] Database access restricted
- [ ] API endpoints protected
- [ ] Audit logging enabled
- [ ] Error handling (no sensitive data in errors)
- [ ] Regular security updates

### **📊 Monitoring & Maintenance**

#### **Required Monitoring**
- Server uptime monitoring
- Application performance monitoring
- Database performance
- Blockchain network status
- Email delivery rates
- Error tracking
- Security alerts

#### **Recommended Tools**
- **Uptime Robot** (FREE) - Server monitoring
- **Sentry** (FREE tier) - Error tracking
- **LogRocket** - User session recording
- **New Relic** - Performance monitoring

### **🆘 Support & Documentation**

#### **Technical Support**
- Infura: [docs.infura.io](https://docs.infura.io)
- Ethers.js: [docs.ethers.org](https://docs.ethers.org)
- MongoDB: [docs.mongodb.com](https://docs.mongodb.com)
- Node.js: [nodejs.org/docs](https://nodejs.org/docs)

#### **Community Resources**
- Stack Overflow
- GitHub Issues
- Discord/Telegram communities
- Reddit communities

### **✅ Success Validation**

Your platform is ready when:
- [ ] All environment variables configured
- [ ] Smart contract deployed and verified
- [ ] Database connected and migrations run
- [ ] Email service sending test emails
- [ ] File uploads working to IPFS
- [ ] Blockchain transactions executing
- [ ] SSL certificate active
- [ ] All tests passing
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

**🎉 Total Setup Time: 2-4 hours for experienced developers**

**💡 Pro Tip:** Start with FREE tiers for all services, then upgrade based on usage patterns and requirements.