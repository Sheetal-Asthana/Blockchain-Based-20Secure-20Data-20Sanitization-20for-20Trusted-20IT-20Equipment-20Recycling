import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Download,
  QrCode,
  AlertCircle,
  FileText
} from "lucide-react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { AssetStatus } from "../../../shared/types";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

interface VerificationData {
  id: number;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash: string;
  carbonCredits: number;
  owner: string;
  registrationTime: number;
  sanitizationTime: number;
  recyclingTime: number;
}

/**
 * Public Verify Page
 * Route: /verify/:id
 * Displays Certificate of Data Destruction
 */
export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const { getAssetHistory, verifyAsset } = useBlockchain();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVerificationData();
    }
  }, [id]);

  const loadVerificationData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get asset by ID first, then by serial number
      let asset;
      if (/^\d+$/.test(id)) {
        // Numeric ID
        asset = await getAssetHistory(parseInt(id));
      } else {
        // Serial number
        asset = await verifyAsset(id);
      }

      setVerificationData(asset);
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError('Asset not found or verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.REGISTERED:
        return { 
          label: 'Registered', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Calendar className="h-4 w-4" />
        };
      case AssetStatus.SANITIZED:
        return { 
          label: 'Sanitized', 
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle2 className="h-4 w-4" />
        };
      case AssetStatus.RECYCLED:
        return { 
          label: 'Recycled', 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Shield className="h-4 w-4" />
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertCircle className="h-4 w-4" />
        };
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Not set';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getIPFSUrl = (hash: string) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying asset...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">
              Please check the asset ID or serial number and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(verificationData.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Certificate of Data Destruction</h1>
          </div>
          <p className="text-gray-600">Blockchain-verified sanitization certificate</p>
        </div>

        {/* Main Certificate Card */}
        <Card className="border-2 border-green-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span>Asset #{verificationData.id}</span>
              <Badge variant="secondary" className={`${statusInfo.color} flex items-center gap-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-100">
              Cryptographically verified on blockchain
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Asset Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Serial Number</h3>
                <p className="text-lg font-semibold">{verificationData.serialNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
                <p className="text-lg font-semibold">{verificationData.model}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Lifecycle Timeline</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Registered</span>
                    <p className="text-xs text-gray-500">{formatDate(verificationData.registrationTime)}</p>
                  </div>
                </div>

                {verificationData.sanitizationTime > 0 && (
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Data Sanitized</span>
                      <p className="text-xs text-gray-500">{formatDate(verificationData.sanitizationTime)}</p>
                    </div>
                  </div>
                )}

                {verificationData.recyclingTime > 0 && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Recycled</span>
                      <p className="text-xs text-gray-500">{formatDate(verificationData.recyclingTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence */}
            {verificationData.sanitizationHash && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Sanitization Evidence</h3>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">IPFS Hash</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getIPFSUrl(verificationData.sanitizationHash), '_blank')}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Log
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <code className="text-xs bg-white p-2 rounded block break-all">
                    {verificationData.sanitizationHash}
                  </code>
                </div>
              </div>
            )}

            {/* Carbon Credits */}
            {verificationData.carbonCredits > 0 && (
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Environmental Impact</span>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {verificationData.carbonCredits} Carbon Credits Earned
                </p>
                <p className="text-xs text-green-600">Contributing to ESG compliance</p>
              </div>
            )}

            {/* Owner */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Current Owner</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(verificationData.owner)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(verificationData.owner)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This certificate is cryptographically secured on the blockchain and cannot be forged. 
            All data sanitization has been verified and recorded immutably.
          </AlertDescription>
        </Alert>

        {/* QR Code */}
        <Card className="max-w-xs mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-sm">Share Certificate</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCodeGenerator 
              value={window.location.href} 
              size={150}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
