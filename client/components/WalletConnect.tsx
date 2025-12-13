import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useState } from "react";

export function WalletConnect() {
  const { wallet, connectWallet, clearError } = useBlockchain();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    clearError();
    await connectWallet();
  };

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 31337: return "Hardhat Local";
      case 80001: return "Polygon Mumbai";
      default: return `Chain ID: ${chainId}`;
    }
  };

  if (wallet.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your MetaMask wallet is successfully connected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {wallet.address ? formatAddress(wallet.address) : 'Unknown'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="secondary">
                {wallet.chainId ? getNetworkName(wallet.chainId) : 'Unknown'}
              </Badge>
            </div>
          </div>

          {copied && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Address copied to clipboard!
              </AlertDescription>
            </Alert>
          )}

          {wallet.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{wallet.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleConnect} 
          disabled={wallet.isLoading}
          className="w-full"
        >
          {wallet.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect MetaMask
            </>
          )}
        </Button>

        {wallet.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{wallet.error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure MetaMask is installed</p>
          <p>• Switch to the correct network</p>
          <p>• Ensure you have enough ETH for gas fees</p>
        </div>
      </CardContent>
    </Card>
  );
}