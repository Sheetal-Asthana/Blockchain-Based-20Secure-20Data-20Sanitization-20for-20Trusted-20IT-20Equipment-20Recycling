import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useBlockchain } from "@/hooks/useBlockchain";

export function AssetRegistration() {
  const { wallet, registerAsset, isLoading, error, clearError } = useBlockchain();
  const [formData, setFormData] = useState({
    serialNumber: "",
    model: "",
  });
  const [registrationResult, setRegistrationResult] = useState<{
    txHash: string;
    assetId: string;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
    setRegistrationResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber.trim() || !formData.model.trim()) {
      return;
    }

    const result = await registerAsset(formData.serialNumber.trim(), formData.model.trim());
    
    if (result) {
      setRegistrationResult({
        txHash: result.txHash,
        assetId: result.assetId.toString(),
      });
      
      // Reset form
      setFormData({
        serialNumber: "",
        model: "",
      });
    }
  };

  const getExplorerUrl = (txHash: string) => {
    if (wallet.chainId === 11155111) {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    } else if (wallet.chainId === 80001) {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    } else if (wallet.chainId === 1) {
      return `https://etherscan.io/tx/${txHash}`;
    }
    return null;
  };

  if (!wallet.isConnected) {
    return (
      <Card className="w-full max-w-md opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Register Asset
          </CardTitle>
          <CardDescription>
            Connect your wallet to register IT assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet first to register assets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Register Asset
        </CardTitle>
        <CardDescription>
          Register a new IT asset for secure recycling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              type="text"
              placeholder="e.g., ABC123XYZ789"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Device Model</Label>
            <Input
              id="model"
              type="text"
              placeholder="e.g., Dell OptiPlex 7090"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !formData.serialNumber.trim() || !formData.model.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Registering...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Register Asset
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {registrationResult && (
          <Alert className="mt-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Asset registered successfully!</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Asset ID:</span>
                    <Badge variant="secondary">{registrationResult.assetId}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Transaction:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {registrationResult.txHash.slice(0, 10)}...
                    </code>
                    {getExplorerUrl(registrationResult.txHash) && (
                      <a
                        href={getExplorerUrl(registrationResult.txHash)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Each asset gets a unique blockchain ID</p>
          <p>• Serial numbers must be unique</p>
          <p>• Only contract owner can register assets</p>
        </div>
      </CardContent>
    </Card>
  );
}