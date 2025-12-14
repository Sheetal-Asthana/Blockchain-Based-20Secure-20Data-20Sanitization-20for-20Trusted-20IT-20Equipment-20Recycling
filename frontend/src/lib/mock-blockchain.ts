// Mock Blockchain Service for Development/Demo
// This simulates blockchain functionality without requiring actual blockchain setup

export enum AssetStatus {
  REGISTERED = 0,
  SANITIZED = 1,
  RECYCLED = 2,
  SOLD = 3
}

export interface Asset {
  id: bigint;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash: string;
  carbonCredits: bigint;
  owner: string;
  registrationTime: bigint;
  sanitizationTime: bigint;
  recyclingTime: bigint;
}

export class MockBlockchainService {
  private assets = new Map<number, Asset>();
  private nextId = 1;
  private isConnected = false;
  private mockAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C89";

  /**
   * Simulate wallet connection
   */
  async connectWallet(): Promise<{ address: string; chainId: number }> {
    // Simulate connection delay
    await this.delay(1000);
    
    this.isConnected = true;
    console.log("🔗 Mock wallet connected");
    
    return {
      address: this.mockAddress,
      chainId: 31337 // Local network
    };
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    return this.isConnected;
  }

  /**
   * Register a new IT asset
   */
  async registerAsset(serialNumber: string, model: string): Promise<{ txHash: string; assetId: bigint }> {
    await this.delay(2000); // Simulate transaction time
    
    // Check for duplicate serial numbers
    for (const asset of this.assets.values()) {
      if (asset.serialNumber === serialNumber) {
        throw new Error(`Serial number ${serialNumber} already exists`);
      }
    }

    const assetId = this.nextId++;
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    const asset: Asset = {
      id: BigInt(assetId),
      serialNumber,
      model,
      status: AssetStatus.REGISTERED,
      sanitizationHash: "",
      carbonCredits: BigInt(0),
      owner: this.mockAddress,
      registrationTime: now,
      sanitizationTime: BigInt(0),
      recyclingTime: BigInt(0)
    };
    
    this.assets.set(assetId, asset);
    
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log(`📝 Asset registered: ID ${assetId}, Serial: ${serialNumber}`);
    
    return {
      txHash,
      assetId: BigInt(assetId)
    };
  }

  /**
   * Prove sanitization of an asset
   */
  async proveSanitization(assetId: bigint, wipeLogHash: string): Promise<string> {
    await this.delay(2000);
    
    const asset = this.assets.get(Number(assetId));
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    
    if (asset.status !== AssetStatus.REGISTERED) {
      throw new Error(`Asset ${assetId} is not in REGISTERED status`);
    }
    
    // Update asset
    asset.status = AssetStatus.SANITIZED;
    asset.sanitizationHash = wipeLogHash;
    asset.sanitizationTime = BigInt(Math.floor(Date.now() / 1000));
    
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log(`🧹 Sanitization proved for asset ${assetId}`);
    
    return txHash;
  }

  /**
   * Recycle an asset
   */
  async recycleAsset(assetId: bigint): Promise<string> {
    await this.delay(2000);
    
    const asset = this.assets.get(Number(assetId));
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    
    if (asset.status !== AssetStatus.SANITIZED) {
      throw new Error(`Asset ${assetId} must be sanitized before recycling`);
    }
    
    // Update asset
    asset.status = AssetStatus.RECYCLED;
    asset.carbonCredits = BigInt(10); // Award 10 carbon credits
    asset.recyclingTime = BigInt(Math.floor(Date.now() / 1000));
    
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log(`♻️ Asset ${assetId} recycled, awarded 10 carbon credits`);
    
    return txHash;
  }

  /**
   * Transfer asset ownership
   */
  async transferAsset(assetId: bigint, newOwner: string): Promise<string> {
    await this.delay(2000);
    
    const asset = this.assets.get(Number(assetId));
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    
    if (asset.status !== AssetStatus.SANITIZED && asset.status !== AssetStatus.RECYCLED) {
      throw new Error(`Asset ${assetId} must be sanitized or recycled before transfer`);
    }
    
    const oldOwner = asset.owner;
    asset.owner = newOwner;
    asset.status = AssetStatus.SOLD;
    
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log(`🔄 Asset ${assetId} transferred from ${oldOwner} to ${newOwner}`);
    
    return txHash;
  }

  /**
   * Get asset history and details
   */
  async getAssetHistory(assetId: bigint): Promise<Asset> {
    await this.delay(500);
    
    const asset = this.assets.get(Number(assetId));
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    
    console.log(`📋 Retrieved asset ${assetId} history`);
    
    return { ...asset }; // Return a copy
  }

  /**
   * Get total number of assets
   */
  async getTotalAssets(): Promise<bigint> {
    await this.delay(300);
    return BigInt(this.assets.size);
  }

  /**
   * Check if serial number exists
   */
  async serialNumberExists(serialNumber: string): Promise<boolean> {
    for (const asset of this.assets.values()) {
      if (asset.serialNumber === serialNumber) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get assets by status (for filtering)
   */
  async getAssetsByStatus(status: AssetStatus, offset: number = 0, limit: number = 10): Promise<bigint[]> {
    await this.delay(500);
    
    const matchingAssets: bigint[] = [];
    let currentIndex = 0;
    
    for (const asset of this.assets.values()) {
      if (asset.status === status) {
        if (currentIndex >= offset && matchingAssets.length < limit) {
          matchingAssets.push(asset.id);
        }
        currentIndex++;
      }
    }
    
    return matchingAssets;
  }

  /**
   * Setup event listeners (mock implementation)
   */
  setupEventListeners(callbacks: {
    onAssetRegistered?: (assetId: bigint, serialNumber: string, model: string, owner: string) => void;
    onAssetSanitized?: (assetId: bigint, sanitizationHash: string, timestamp: bigint) => void;
    onAssetRecycled?: (assetId: bigint, carbonCredits: bigint, timestamp: bigint) => void;
    onAssetTransferred?: (assetId: bigint, from: string, to: string, timestamp: bigint) => void;
  }) {
    console.log("👂 Mock event listeners setup (events will be logged to console)");
    // In a real implementation, this would set up blockchain event listeners
    // For mock, we just log that listeners are ready
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    console.log("🔇 Mock event listeners removed");
  }

  /**
   * Utility function to simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mock transaction receipt URL (for demo purposes)
   */
  getTransactionUrl(txHash: string): string {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  /**
   * Seed some demo data
   */
  async seedDemoData() {
    console.log("🌱 Seeding demo data...");
    
    // Register demo assets
    await this.registerAsset("DEMO-001", "Dell OptiPlex 7090");
    await this.registerAsset("DEMO-002", "HP EliteBook 840");
    await this.registerAsset("DEMO-003", "Lenovo ThinkPad T14");
    
    // Sanitize first asset
    await this.proveSanitization(BigInt(1), "QmX1234567890abcdefghijklmnopqrstuvwxyz");
    
    // Recycle first asset
    await this.recycleAsset(BigInt(1));
    
    // Sanitize second asset
    await this.proveSanitization(BigInt(2), "QmY0987654321zyxwvutsrqponmlkjihgfedcba");
    
    console.log("✅ Demo data seeded successfully!");
  }
}

// Export singleton instance
export const mockBlockchainService = new MockBlockchainService();

// Auto-seed demo data
mockBlockchainService.seedDemoData();