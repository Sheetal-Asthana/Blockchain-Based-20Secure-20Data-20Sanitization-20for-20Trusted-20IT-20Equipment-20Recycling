import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HardDrive, 
  Play, 
  CheckCircle2, 
  Upload,
  Shield,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { AssetStatus } from "../../../shared/types";

interface PendingAsset {
  id: number;
  serialNumber: string;
  model: string;
  status: AssetStatus;
}

interface WipeProgress {
  assetId: number;
  stage: 'wiping' | 'uploading' | 'minting' | 'complete';
  progress: number;
  message: string;
}

export default function Technician() {
  const { getAssetsByStatus, proveSanitization, isLoading } = useBlockchain();
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [wipeProgress, setWipeProgress] = useState<WipeProgress | null>(null);
  const [completedAssets, setCompletedAssets] = useState<number[]>([]);

  useEffect(() => {
    loadPendingAssets();
  }, []);

  const loadPendingAssets = async () => {
    try {
      const result = await getAssetsByStatus(AssetStatus.REGISTERED);
      const assets = result.assetIds.map(id => ({
        id,
        serialNumber: `DELL-XP-${id.toString().padStart(3, '0')}`,
        model: 'XPS 15',
        status: AssetStatus.REGISTERED
      }));
      setPendingAssets(assets);
    } catch (error) {
      console.error("Failed to load pending assets:", error);
    }
  };

  const simulateWipe = async (asset: PendingAsset) => {
    setWipeProgress({
      assetId: asset.id,
      stage: 'wiping',
      progress: 0,
      message: 'Initializing secure wipe...'
    });

    // Stage 1: Wiping Data (0-60%)
    for (let i = 0; i <= 60; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setWipeProgress(prev => prev ? {
        ...prev,
        progress: i,
        message: i < 30 ? 'Wiping Data...' : 'Verifying erasure...'
      } : null);
    }

    // Stage 2: Uploading Evidence (60-80%)
    setWipeProgress(prev => prev ? {
      ...prev,
      stage: 'uploading',
      progress: 60,
      message: 'Uploading Evidence...'
    } : null);

    // Generate dummy wipe log
    const wipeLog = {
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      model: asset.model,
      method: 'DBAN',
      passes: 3,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      operator: 'Technician-001',
      verification: {
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}`,
        status: 'VERIFIED'
      }
    };

    // Simulate IPFS upload
    for (let i = 60; i <= 80; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setWipeProgress(prev => prev ? { ...prev, progress: i } : null);
    }

    // Generate fake IPFS hash
    const ipfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Stage 3: Minting Certificate (80-100%)
    setWipeProgress(prev => prev ? {
      ...prev,
      stage: 'minting',
      progress: 80,
      message: 'Minting Certificate...'
    } : null);

    try {
      // Call blockchain to prove sanitization
      await proveSanitization({ assetId: asset.id, ipfsHash });

      for (let i = 80; i <= 100; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setWipeProgress(prev => prev ? { ...prev, progress: i } : null);
      }

      // Complete
      setWipeProgress(prev => prev ? {
        ...prev,
        stage: 'complete',
        progress: 100,
        message: 'Certificate minted successfully!'
      } : null);

      setCompletedAssets(prev => [...prev, asset.id]);
      
      // Remove from pending
      setPendingAssets(prev => prev.filter(a => a.id !== asset.id));

      // Clear progress after 3 seconds
      setTimeout(() => setWipeProgress(null), 3000);

    } catch (error) {
      console.error("Failed to prove sanitization:", error);
      setWipeProgress(prev => prev ? {
        ...prev,
        stage: 'complete',
        progress: 100,
        message: 'Error: Failed to mint certificate'
      } : null);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'wiping': return <HardDrive className="h-4 w-4" />;
      case 'uploading': return <Upload className="h-4 w-4" />;
      case 'minting': return <Shield className="h-4 w-4" />;
      case 'complete': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'wiping': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      case 'minting': return 'text-purple-600';
      case 'complete': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
          <p className="text-gray-600">Secure data sanitization workstation</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Recycling Center - Station 001</span>
          </div>
        </div>

        {/* Wipe Progress */}
        {wipeProgress && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${getStageColor(wipeProgress.stage)}`}>
                {getStageIcon(wipeProgress.stage)}
                Asset #{wipeProgress.assetId} - {wipeProgress.message}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={wipeProgress.progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{wipeProgress.progress}% Complete</span>
                <span className="capitalize">{wipeProgress.stage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Assets */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Sanitization</h2>
          
          {pendingAssets.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-gray-600">All assets processed!</p>
                <p className="text-sm text-gray-400">No pending sanitization tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{asset.serialNumber}</span>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{asset.model}</p>
                        <p className="text-xs text-gray-400">Ready for secure wipe</p>
                      </div>
                      
                      <Button
                        onClick={() => simulateWipe(asset)}
                        disabled={!!wipeProgress || isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Sanitize Device
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Assets */}
        {completedAssets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recently Completed</h2>
            <div className="grid gap-2">
              {completedAssets.map((assetId) => (
                <Card key={assetId} className="bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Asset #{assetId}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Sanitized
                      </Badge>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="h-5 w-5" />
              Sanitization Process
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <p>• Click "Sanitize Device" to begin secure data wipe</p>
            <p>• Process includes: Data wiping → Evidence upload → Certificate minting</p>
            <p>• Each device receives a blockchain-verified certificate</p>
            <p>• IPFS hash provides immutable proof of sanitization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}