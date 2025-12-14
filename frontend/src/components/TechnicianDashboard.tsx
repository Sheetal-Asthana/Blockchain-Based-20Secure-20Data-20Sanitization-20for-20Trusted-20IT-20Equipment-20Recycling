import React, { useState, useEffect } from 'react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';

interface AssetWithDetails {
  id: number;
  serialNumber: string;
  model: string;
  status: number;
  ipfsHash?: string;
}

/**
 * TechnicianDashboard Component
 * Allows technicians to:
 * 1. View registered assets
 * 2. Simulate sanitization (3-second progress bar)
 * 3. Auto-generate sanitization proof JSON
 * 4. Upload to IPFS via backend
 * 5. Call proveSanitization() on blockchain
 */
export function TechnicianDashboard() {
  const { getAssetsByStatus, getTotalAssets, proveSanitization, isInitialized, account } = useBlockchain();
  const { toast } = useToast();

  const [assets, setAssets] = useState<AssetWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sanitizingId, setSanitizingId] = useState<number | null>(null);
  const [sanitizationProgress, setSanitizationProgress] = useState(0);

  // Load registered assets on mount
  useEffect(() => {
    loadRegisteredAssets();
  }, [isInitialized]);

  const loadRegisteredAssets = async () => {
    try {
      setLoading(true);
      const result = await getAssetsByStatus(0, 0, 100); // Status 0 = REGISTERED
      
      if (result && result.assetIds) {
        // For demo, create mock assets (in real app, fetch full details)
        const mockAssets = result.assetIds.map((id: number) => ({
          id,
          serialNumber: `DEVICE-${String(id).padStart(5, '0')}`,
          model: 'Dell OptiPlex 7090',
          status: 0,
          ipfsHash: ''
        }));
        setAssets(mockAssets);
      }
    } catch (err: any) {
      console.error('Load assets error:', err);
      toast({
        title: 'Load Failed',
        description: 'Could not load assets. Make sure MetaMask is connected.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Simulate sanitization with progress bar
   * Then upload proof to IPFS and call blockchain
   */
  const handleSanitize = async (assetId: number) => {
    try {
      setSanitizingId(assetId);
      setSanitizationProgress(0);

      // Phase 1: Simulate 3-second sanitization progress
      toast({
        title: 'Sanitization Started',
        description: 'Simulating secure data wipe...',
        duration: 3000
      });

      // Animate progress bar
      const progressInterval = setInterval(() => {
        setSanitizationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Phase 2: Generate mock sanitization proof
      const sanitizationProof = {
        assetId,
        timestamp: new Date().toISOString(),
        technicianAddress: account,
        sanitizationMethod: 'DBAN (Darik\'s Boot and Nuke)',
        status: 'SUCCESS',
        details: {
          wipeMethod: 'DoD 5220.22-M',
          passCount: 3,
          dataDestroyed: true,
          cipherKey: Math.random().toString(36).substring(2, 15)
        }
      };

      toast({
        title: 'Uploading Proof...',
        description: 'Sending sanitization evidence to IPFS',
        duration: Infinity
      });

      // Phase 3: Upload to IPFS via backend
      const uploadResponse = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizationProof)
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const uploadData = await uploadResponse.json();
      const ipfsHash = uploadData.ipfsHash || uploadData.cid;

      if (!ipfsHash) {
        throw new Error('No IPFS hash returned');
      }

      toast({
        title: 'Calling Blockchain...',
        description: `IPFS Hash: ${ipfsHash.slice(0, 20)}... Confirm in MetaMask`,
        duration: Infinity
      });

      // Phase 4: Call proveSanitization on blockchain
      const result = await proveSanitization({
        assetId,
        ipfsHash
      });

      toast({
        title: 'Sanitization Proof Recorded!',
        description: `TX: ${result.transactionHash.slice(0, 20)}...`,
        variant: 'default'
      });

      // Update local asset
      setAssets(prev => prev.map(a => 
        a.id === assetId 
          ? { ...a, status: 1, ipfsHash } 
          : a
      ));

      setSanitizationProgress(0);
    } catch (err: any) {
      toast({
        title: 'Sanitization Failed',
        description: err.message || 'Error during sanitization',
        variant: 'destructive'
      });
      console.error('Sanitization error:', err);
    } finally {
      setSanitizingId(null);
      setSanitizationProgress(0);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">MetaMask Not Connected</p>
              <p className="text-sm text-red-700">Please install and connect MetaMask to use the Technician Dashboard.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Technician Dashboard
            {account && <span className="text-xs font-mono text-gray-500 ml-auto">{account.slice(0, 10)}...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            View registered assets and prove their secure sanitization via IPFS
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Loading assets...</p>
        </Card>
      ) : assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-2">No registered assets found</p>
            <p className="text-xs text-gray-400 mt-1">Register assets first using the Asset Registry component</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className={sanitizingId === asset.id ? 'ring-2 ring-blue-400' : ''}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Asset Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
                      <p className="font-mono font-semibold">{asset.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Model</p>
                      <p className="font-semibold">{asset.model}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      asset.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                      asset.status === 1 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {asset.status === 0 && '📝 Registered'}
                      {asset.status === 1 && '✅ Sanitized'}
                      {asset.status === 2 && '♻️ Recycled'}
                    </span>
                  </div>

                  {/* Progress Bar (showing during sanitization) */}
                  {sanitizingId === asset.id && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Sanitizing...</span>
                        <span className="text-sm text-gray-500">{sanitizationProgress}%</span>
                      </div>
                      <Progress value={sanitizationProgress} className="h-2" />
                    </div>
                  )}

                  {/* IPFS Hash Display */}
                  {asset.ipfsHash && (
                    <div className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">IPFS Hash</p>
                        <p className="font-mono text-xs break-all text-green-700">{asset.ipfsHash}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSanitize(asset.id)}
                    disabled={asset.status !== 0 || sanitizingId !== null}
                    className="w-full"
                    variant={asset.status === 0 ? 'default' : 'secondary'}
                  >
                    {sanitizingId === asset.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sanitizing...
                      </>
                    ) : asset.status === 0 ? (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Start Sanitization
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Already Sanitized
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
