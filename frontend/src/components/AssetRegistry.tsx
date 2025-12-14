import React, { useState } from 'react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * AssetRegistry Component
 * Allows users to register new IT assets on the blockchain
 * Calls registerAsset() from the smart contract
 */
export function AssetRegistry() {
  const { registerAsset, isInitialized, account, error: blockchainError } = useBlockchain();
  const { toast } = useToast();
  
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredAssets, setRegisteredAssets] = useState<Array<{ serial: string; model: string; txHash: string }>>([]);

  if (!isInitialized) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">MetaMask Not Connected</p>
              <p className="text-sm text-red-700">{blockchainError || 'Please install and connect MetaMask to register assets.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serialNumber.trim() || !model.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both serial number and model.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: 'Processing...',
        description: 'Registering asset on blockchain. Please confirm in MetaMask.',
        duration: Infinity
      });

      const result = await registerAsset({ serialNumber, model });

      // Add to local list
      setRegisteredAssets(prev => [...prev, {
        serial: serialNumber,
        model: model,
        txHash: result.transactionHash
      }]);

      toast({
        title: 'Success!',
        description: `Asset registered with TX: ${result.transactionHash.slice(0, 10)}...`,
        variant: 'default'
      });

      // Clear form
      setSerialNumber('');
      setModel('');
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register asset',
        variant: 'destructive'
      });
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Asset Registration
            {account && <span className="text-xs font-mono text-gray-500 ml-auto">{account.slice(0, 10)}...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Serial Number</label>
              <Input
                placeholder="e.g., DELL-SN-12345"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Device Model</label>
              <Input
                placeholder="e.g., Dell OptiPlex 7090"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Asset'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {registeredAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registeredAssets.map((asset, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold">{asset.serial}</p>
                    <p className="text-xs text-gray-600">{asset.model}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">TX: {asset.txHash.slice(0, 20)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
