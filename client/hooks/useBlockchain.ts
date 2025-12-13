import { useState, useEffect, useCallback } from 'react';
import { blockchainService, Asset, AssetStatus } from '@/lib/blockchain';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface UseBlockchainReturn {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  registerAsset: (serialNumber: string, model: string) => Promise<{ txHash: string; assetId: bigint } | null>;
  proveSanitization: (assetId: bigint, wipeLogHash: string) => Promise<string | null>;
  recycleAsset: (assetId: bigint) => Promise<string | null>;
  transferAsset: (assetId: bigint, newOwner: string) => Promise<string | null>;
  getAssetHistory: (assetId: bigint) => Promise<Asset | null>;
  getTotalAssets: () => Promise<bigint | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useBlockchain(): UseBlockchainReturn {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
    setupWalletEventListeners();

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    try {
      setWallet(prev => ({ ...prev, isLoading: true }));
      
      const isConnected = await blockchainService.isWalletConnected();
      
      if (isConnected) {
        const { address, chainId } = await blockchainService.connectWallet();
        setWallet({
          isConnected: true,
          address,
          chainId,
          isLoading: false,
          error: null,
        });
      } else {
        setWallet(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check wallet connection',
      }));
    }
  };

  const setupWalletEventListeners = () => {
    if (!window.ethereum) return;

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWallet({
        isConnected: false,
        address: null,
        chainId: null,
        isLoading: false,
        error: null,
      });
    } else {
      // User switched accounts
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
      }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes (recommended by MetaMask)
    window.location.reload();
  };

  const connectWallet = useCallback(async () => {
    try {
      setWallet(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { address, chainId } = await blockchainService.connectWallet();
      
      setWallet({
        isConnected: true,
        address,
        chainId,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      setError(errorMessage);
    }
  }, []);

  const registerAsset = useCallback(async (serialNumber: string, model: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await blockchainService.registerAsset(serialNumber, model);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register asset';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const proveSanitization = useCallback(async (assetId: bigint, wipeLogHash: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.proveSanitization(assetId, wipeLogHash);
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to prove sanitization';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recycleAsset = useCallback(async (assetId: bigint) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.recycleAsset(assetId);
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to recycle asset';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferAsset = useCallback(async (assetId: bigint, newOwner: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await blockchainService.transferAsset(assetId, newOwner);
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer asset';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAssetHistory = useCallback(async (assetId: bigint) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const asset = await blockchainService.getAssetHistory(assetId);
      return asset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get asset history';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTotalAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const total = await blockchainService.getTotalAssets();
      return total;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get total assets';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setWallet(prev => ({ ...prev, error: null }));
  }, []);

  return {
    wallet,
    connectWallet,
    registerAsset,
    proveSanitization,
    recycleAsset,
    transferAsset,
    getAssetHistory,
    getTotalAssets,
    isLoading,
    error,
    clearError,
  };
}