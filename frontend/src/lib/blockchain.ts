import { ethers } from 'ethers';

// Contract ABI - You'll get this from the compiled contract
const ITAssetManagerABI = [
  // Events
  "event AssetRegistered(uint256 indexed assetId, string serialNumber, string model, address indexed owner)",
  "event AssetSanitized(uint256 indexed assetId, string sanitizationHash, uint256 timestamp)",
  "event AssetRecycled(uint256 indexed assetId, uint256 carbonCredits, uint256 timestamp)",
  "event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 timestamp)",
  
  // Functions
  "function registerAsset(string calldata serialNumber, string calldata model) external returns (uint256)",
  "function proveSanitization(uint256 assetId, string calldata wipeLogHash) external",
  "function recycleAsset(uint256 assetId) external",
  "function transferAsset(uint256 assetId, address newOwner) external",
  "function getAssetHistory(uint256 assetId) external view returns (tuple(uint256 id, string serialNumber, string model, uint8 status, string sanitizationHash, uint256 carbonCredits, address owner, uint256 registrationTime, uint256 sanitizationTime, uint256 recyclingTime))",
  "function getTotalAssets() external view returns (uint256)",
  "function serialNumberExists(string calldata serialNumber) external view returns (bool)",
  "function getAssetsByStatus(uint8 status, uint256 offset, uint256 limit) external view returns (uint256[])",
  "function owner() external view returns (address)"
];

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update this after deployment

// Development mode - set to false when real blockchain is ready
const USE_MOCK_BLOCKCHAIN = true;

// Asset status enum
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

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ address: string; chainId: number }> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      const address = await this.signer.getAddress();

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, ITAssetManagerABI, this.signer);

      console.log('✅ Wallet connected:', { address, chainId: Number(network.chainId) });

      return {
        address,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  }

  /**
   * Register a new IT asset
   */
  async registerAsset(serialNumber: string, model: string): Promise<{ txHash: string; assetId: bigint }> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      console.log('📝 Registering asset:', { serialNumber, model });

      // Call the contract function
      const tx = await this.contract.registerAsset(serialNumber, model);
      console.log('⏳ Transaction sent:', tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Parse the event to get the asset ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'AssetRegistered';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('AssetRegistered event not found in transaction receipt');
      }

      const parsedEvent = this.contract.interface.parseLog(event);
      const assetId = parsedEvent!.args[0];

      console.log('🎉 Asset registered successfully:', { assetId: assetId.toString(), txHash: receipt.hash });

      return {
        txHash: receipt.hash,
        assetId: assetId
      };
    } catch (error) {
      console.error('❌ Failed to register asset:', error);
      throw error;
    }
  }

  /**
   * Prove sanitization of an asset
   */
  async proveSanitization(assetId: bigint, wipeLogHash: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      console.log('🧹 Proving sanitization:', { assetId: assetId.toString(), wipeLogHash });

      const tx = await this.contract.proveSanitization(assetId, wipeLogHash);
      console.log('⏳ Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Sanitization proved:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to prove sanitization:', error);
      throw error;
    }
  }

  /**
   * Recycle an asset
   */
  async recycleAsset(assetId: bigint): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      console.log('♻️ Recycling asset:', assetId.toString());

      const tx = await this.contract.recycleAsset(assetId);
      console.log('⏳ Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Asset recycled:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to recycle asset:', error);
      throw error;
    }
  }

  /**
   * Transfer asset ownership
   */
  async transferAsset(assetId: bigint, newOwner: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      console.log('🔄 Transferring asset:', { assetId: assetId.toString(), newOwner });

      const tx = await this.contract.transferAsset(assetId, newOwner);
      console.log('⏳ Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Asset transferred:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to transfer asset:', error);
      throw error;
    }
  }

  /**
   * Get asset history and details
   */
  async getAssetHistory(assetId: bigint): Promise<Asset> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      console.log('📋 Getting asset history:', assetId.toString());

      const result = await this.contract.getAssetHistory(assetId);
      
      const asset: Asset = {
        id: result[0],
        serialNumber: result[1],
        model: result[2],
        status: result[3],
        sanitizationHash: result[4],
        carbonCredits: result[5],
        owner: result[6],
        registrationTime: result[7],
        sanitizationTime: result[8],
        recyclingTime: result[9]
      };

      console.log('📊 Asset details:', asset);
      return asset;
    } catch (error) {
      console.error('❌ Failed to get asset history:', error);
      throw error;
    }
  }

  /**
   * Get total number of assets
   */
  async getTotalAssets(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      const total = await this.contract.getTotalAssets();
      return total;
    } catch (error) {
      console.error('❌ Failed to get total assets:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  setupEventListeners(callbacks: {
    onAssetRegistered?: (assetId: bigint, serialNumber: string, model: string, owner: string) => void;
    onAssetSanitized?: (assetId: bigint, sanitizationHash: string, timestamp: bigint) => void;
    onAssetRecycled?: (assetId: bigint, carbonCredits: bigint, timestamp: bigint) => void;
    onAssetTransferred?: (assetId: bigint, from: string, to: string, timestamp: bigint) => void;
  }) {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    // Listen for AssetRegistered events
    if (callbacks.onAssetRegistered) {
      this.contract.on('AssetRegistered', callbacks.onAssetRegistered);
    }

    // Listen for AssetSanitized events
    if (callbacks.onAssetSanitized) {
      this.contract.on('AssetSanitized', callbacks.onAssetSanitized);
    }

    // Listen for AssetRecycled events
    if (callbacks.onAssetRecycled) {
      this.contract.on('AssetRecycled', callbacks.onAssetRecycled);
    }

    // Listen for AssetTransferred events
    if (callbacks.onAssetTransferred) {
      this.contract.on('AssetTransferred', callbacks.onAssetTransferred);
    }

    console.log('👂 Event listeners setup complete');
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
      console.log('🔇 All event listeners removed');
    }
  }
}

// Import mock service
import { mockBlockchainService } from './mock-blockchain';

// Export a singleton instance
export const blockchainService = USE_MOCK_BLOCKCHAIN 
  ? mockBlockchainService 
  : new BlockchainService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}