import { useState, useEffect } from 'react';
import { blockchainService, Asset, AssetStatus } from '@/lib/blockchain';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export function useBlockchain() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const isConnected = await blockchainService.isWalletConnected();
      if (isConnected) {
        // If already connected, get the wallet info
        const walletInfo = await blockchainService.connectWallet();
        setWallet({
          isConnected: true,
          address: walletInfo.address,
          chainId: walletInfo.chainId
        });
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const walletInfo = await blockchainService.connectWallet();
      setWallet({
        isConnected: true,
        address: walletInfo.address,
        chainId: walletInfo.chainId
      });
      
      return walletInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null
    });
  };

  const registerAsset = async (serialNumber: string, model: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await blockchainService.registerAsset(serialNumber, model);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetHistory = async (assetId: bigint): Promise<Asset> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const asset = await blockchainService.getAssetHistory(assetId);
      return asset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const proveSanitization = async (assetId: bigint, sanitizationHash: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.proveSanitization(assetId, sanitizationHash);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recycleAsset = async (assetId: bigint) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.recycleAsset(assetId);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const transferAsset = async (assetId: bigint, newOwner: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.transferAsset(assetId, newOwner);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalAssets = async () => {
    try {
      const total = await blockchainService.getTotalAssets();
      return total;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    wallet,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    registerAsset,
    getAssetHistory,
    proveSanitization,
    recycleAsset,
    transferAsset,
    getTotalAssets,
    clearError
  };
}