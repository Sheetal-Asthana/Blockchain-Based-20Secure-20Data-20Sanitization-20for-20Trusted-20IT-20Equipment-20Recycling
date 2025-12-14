/**
 * Blockchain Integration Service
 * Handles communication with deployed smart contracts
 */

import { ethers } from 'ethers';

// Contract ABI - will be updated after deployment
const CONTRACT_ABI = [
  "function registerAsset(string calldata serialNumber, string calldata model) external returns (uint256)",
  "function proveSanitization(uint256 assetId, string calldata wipeLogHash) external",
  "function recycleAsset(uint256 assetId) external",
  "function transferAsset(uint256 assetId, address newOwner) external",
  "function getAssetHistory(uint256 assetId) external view returns (tuple(uint256 id, string serialNumber, string model, uint8 status, string sanitizationHash, uint256 carbonCredits, address owner, uint256 registrationTime, uint256 sanitizationTime, uint256 recyclingTime))",
  "function getTotalAssets() external view returns (uint256)",
  "function serialNumberExists(string calldata serialNumber) external view returns (bool)",
  "function getAssetsByStatus(uint8 status, uint256 offset, uint256 limit) external view returns (uint256[])"
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.ENABLE_BLOCKCHAIN === 'true';
    
    if (this.isEnabled) {
      this.initializeProvider();
    }
  }

  private initializeProvider() {
    try {
      // Use local Hardhat node for development, fallback to Sepolia
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || process.env.SEPOLIA_RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (contractAddress && contractAddress !== '0x5FbDB2315678afecb367f032d93F642f64180aa3') {
        this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);
        console.log('✅ Blockchain service initialized with contract:', contractAddress);
        console.log('🔗 Using RPC URL:', rpcUrl);
      } else {
        console.log('⚠️ Contract address not set - blockchain features disabled');
      }
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if blockchain integration is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.contract !== null;
  }

  /**
   * Get blockchain status for API
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      network: null, // Will be populated when provider is available
      contractAddress: process.env.CONTRACT_ADDRESS || null
    };
  }

  /**
   * Get asset details from blockchain
   */
  async getAsset(assetId: number) {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service not available');
    }

    try {
      const asset = await this.contract!.getAssetHistory(assetId);
      return {
        id: Number(asset.id),
        serialNumber: asset.serialNumber,
        model: asset.model,
        status: Number(asset.status),
        sanitizationHash: asset.sanitizationHash,
        carbonCredits: Number(asset.carbonCredits),
        owner: asset.owner,
        registrationTime: Number(asset.registrationTime),
        sanitizationTime: Number(asset.sanitizationTime),
        recyclingTime: Number(asset.recyclingTime)
      };
    } catch (error) {
      console.error('Error fetching asset from blockchain:', error);
      throw error;
    }
  }

  /**
   * Get total number of assets
   */
  async getTotalAssets(): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const total = await this.contract!.getTotalAssets();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total assets:', error);
      return 0;
    }
  }

  /**
   * Check if serial number exists
   */
  async serialNumberExists(serialNumber: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return await this.contract!.serialNumberExists(serialNumber);
    } catch (error) {
      console.error('Error checking serial number:', error);
      return false;
    }
  }

  /**
   * Get assets by status
   */
  async getAssetsByStatus(status: number, offset: number = 0, limit: number = 10) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const assetIds = await this.contract!.getAssetsByStatus(status, offset, limit);
      return assetIds.map((id: any) => Number(id));
    } catch (error) {
      console.error('Error fetching assets by status:', error);
      return [];
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) {
      return null;
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Error fetching network info:', error);
      return null;
    }
  }

  /**
   * Register asset on blockchain
   */
  async registerAsset(serialNumber: string, model: string) {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service not available');
    }

    try {
      // Create a wallet from private key for transactions
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract!.connect(wallet);

      const tx = await contractWithSigner.registerAsset(serialNumber, model);
      const receipt = await tx.wait();

      // Extract asset ID from logs
      const assetId = receipt.logs[0]?.topics[1] ? BigInt(receipt.logs[0].topics[1]) : BigInt(0);

      return {
        txHash: receipt.hash,
        assetId: Number(assetId),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error registering asset on blockchain:', error);
      throw error;
    }
  }

  /**
   * Prove sanitization on blockchain
   */
  async proveSanitization(assetId: bigint, sanitizationHash: string) {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service not available');
    }

    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract!.connect(wallet);

      const tx = await contractWithSigner.proveSanitization(assetId, sanitizationHash);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error) {
      console.error('Error proving sanitization on blockchain:', error);
      throw error;
    }
  }

  /**
   * Recycle asset on blockchain
   */
  async recycleAsset(assetId: bigint) {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service not available');
    }

    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract!.connect(wallet);

      const tx = await contractWithSigner.recycleAsset(assetId);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error) {
      console.error('Error recycling asset on blockchain:', error);
      throw error;
    }
  }

  /**
   * Transfer asset on blockchain
   */
  async transferAsset(assetId: bigint, newOwner: string) {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service not available');
    }

    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract!.connect(wallet);

      const tx = await contractWithSigner.transferAsset(assetId, newOwner);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error) {
      console.error('Error transferring asset on blockchain:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();