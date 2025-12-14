import { ethers } from 'ethers';
import { apiService } from './api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string | null = null;

  // Contract ABI - matches the server-side ABI
  private readonly CONTRACT_ABI = [
    "function registerAsset(string calldata serialNumber, string calldata model) external returns (uint256)",
    "function proveSanitization(uint256 assetId, string calldata wipeLogHash) external",
    "function recycleAsset(uint256 assetId) external",
    "function transferAsset(uint256 assetId, address newOwner) external",
    "function getAssetHistory(uint256 assetId) external view returns (tuple(uint256 id, string serialNumber, string model, uint8 status, string sanitizationHash, uint256 carbonCredits, address owner, uint256 registrationTime, uint256 sanitizationTime, uint256 recyclingTime))",
    "function getTotalAssets() external view returns (uint256)",
    "function serialNumberExists(string calldata serialNumber) external view returns (bool)",
    "function getAssetsByStatus(uint8 status, uint256 offset, uint256 limit) external view returns (uint256[])"
  ];

  async initialize() {
    try {
      // Get blockchain status from server
      const statusResponse = await apiService.getBlockchainStatus();
      if (!statusResponse.success || !statusResponse.data.available) {
        throw new Error('Blockchain service not available on server');
      }

      this.contractAddress = statusResponse.data.contractAddress;

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();

      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.CONTRACT_ABI,
          this.signer
        );
      }

      return true;
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.CONTRACT_ABI,
          this.signer
        );
      }

      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async getWalletAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        await this.initialize();
      }
      return this.signer ? await this.signer.getAddress() : null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }

  async getNetworkInfo() {
    try {
      if (!this.provider) {
        await this.initialize();
      }
      
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  async registerAsset(serialNumber: string, model: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.registerAsset(serialNumber, model);
      const receipt = await tx.wait();
      
      // Extract asset ID from logs
      const assetId = receipt.logs[0]?.args?.[0] || 0;
      
      return {
        txHash: receipt.hash,
        assetId: Number(assetId),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Asset registration failed:', error);
      throw error;
    }
  }

  async proveSanitization(assetId: number, wipeLogHash: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.proveSanitization(assetId, wipeLogHash);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Sanitization proof failed:', error);
      throw error;
    }
  }

  async recycleAsset(assetId: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.recycleAsset(assetId);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Asset recycling failed:', error);
      throw error;
    }
  }

  async transferAsset(assetId: number, newOwner: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.transferAsset(assetId, newOwner);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Asset transfer failed:', error);
      throw error;
    }
  }

  async getAssetHistory(assetId: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const asset = await this.contract.getAssetHistory(assetId);
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
      console.error('Failed to get asset history:', error);
      throw error;
    }
  }

  async getTotalAssets(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const total = await this.contract.getTotalAssets();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total assets:', error);
      throw error;
    }
  }

  async serialNumberExists(serialNumber: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.serialNumberExists(serialNumber);
    } catch (error) {
      console.error('Failed to check serial number:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return !!this.provider && !!this.signer && !!this.contract;
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for network changes
  onChainChanged(callback: (chainId: string) => void) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}

export const blockchainService = new BlockchainService();