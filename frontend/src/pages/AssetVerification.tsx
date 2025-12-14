import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Download,
  QrCode,
  AlertCircle,
  FileText,
  Search,
  Recycle,
  Building2
} from "lucide-react";
import { AssetStatus } from "../../../shared/types";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { apiService } from "@/services/api";

interface AssetData {
  _id: string;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash?: string;
  carbonCredits: number;
  owner: string;
  customer?: string;
  location?: string;
  registrationTime: string;
  sanitizationTime?: string;
  recyclingTime?: string;
  blockchainTxHash?: string;
  blockchainAssetId?: string;
}

/**
 * Public Asset Verification Page
 * Route: /verify/:id or /verify?serial=XXX
 * Displays comprehensive asset information and verification status
 */
export default function AssetVerification() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const serialParam = searchParams.get('serial');
  
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchSerial, setSearchSerial] = useState(serialParam || '');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (id) {
      loadAssetById(id);
    } else if (serialParam) {
      searchBySerial(serialParam);
    } else {
      setLoading(false);
    }
  }, [id, serialParam]);

  const loadAssetById = async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getAsset(assetId);
      if (response.success && response.data) {
        setAssetData(response.data as AssetData);
      } else {
        setError('Asset not found');
      }
    } catch (err: any) {
      console.error('Asset lookup failed:', err);
      setError('Asset not found or verification failed');
    } finally {
      setLoading(false);
    }
  };

  const searchBySerial = async (serial: string) => {
    try {
      setIsSearching(true);
      setError(null);

      // Search assets by serial number
      const response = await apiService.get(`/assets?search=${encodeURIComponent(serial)}&limit=1`);
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setAssetData(response.data[0] as AssetData);
      } else {
        setError('Asset not found with this serial number');
      }
    } catch (err: any) {
      console.error('Serial search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSerialSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSerial.trim()) {
      searchBySerial(searchSerial.trim());
    }
  };

  const getStatusInfo = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.REGISTERED:
        return { 
          label: 'Registered', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Calendar className="h-4 w-4" />,
          description: 'Asset has been registered in the system'
        };
      case AssetStatus.SANITIZED:
        return { 
          label: 'Data Sanitized', 
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle2 className="h-4 w-4" />,
          description: 'Data has been securely wiped and verified'
        };
      case AssetStatus.RECYCLED:
        return { 
          label: 'Recycled', 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Recycle className="h-4 w-4" />,
          description: 'Asset has been processed for recycling'
        };
      case AssetStatus.SOLD:
        return { 
          label: 'Sold/Transferred', 
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Building2 className="h-4 w-4" />,
          description: 'Asset has been transferred to new owner'
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'Status unknown'
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const currentUrl = window.location.href;

  // Search interface when no asset is loaded
  if (!loading && !assetData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Asset Verification
            </CardTitle>
            <CardDescription>
              Enter a serial number to verify asset status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSerialSearch} className="space-y-4">
              <Input
                placeholder="Enter serial number (e.g., DELL-XPS-123456)"
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? 'Searching...' : 'Verify Asset'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || isSearching) {
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

  if (error || !assetData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(assetData.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Asset Verification Certificate</h1>
          </div>
          <p className="text-gray-600">Blockchain-secured IT asset lifecycle tracking</p>
        </div>

        {/* Main Certificate Card */}
        <Card className="border-2 border-green-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span>Asset: {assetData.serialNumber}</span>
              <Badge variant="secondary" className={`${statusInfo.color} flex items-center gap-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-100">
              {statusInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Asset Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Serial Number</h3>
                <p className="text-lg font-semibold">{assetData.serialNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
                <p className="text-lg font-semibold">{assetData.model}</p>
              </div>
              {assetData.customer && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
                  <p className="text-sm">{assetData.customer}</p>
                </div>
              )}
              {assetData.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <p className="text-sm">{assetData.location}</p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Lifecycle Timeline</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Registered</span>
                    <p className="text-xs text-gray-500">{formatDate(assetData.registrationTime)}</p>
                  </div>
                </div>

                {assetData.sanitizationTime && (
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Data Sanitized</span>
                      <p className="text-xs text-gray-500">{formatDate(assetData.sanitizationTime)}</p>
                    </div>
                  </div>
                )}

                {assetData.recyclingTime && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Recycled</span>
                      <p className="text-xs text-gray-500">{formatDate(assetData.recyclingTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sanitization Evidence */}
            {assetData.sanitizationHash && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Sanitization Evidence</h3>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">IPFS Hash</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getIPFSUrl(assetData.sanitizationHash!), '_blank')}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Evidence
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <code className="text-xs bg-white p-2 rounded block break-all">
                    {assetData.sanitizationHash}
                  </code>
                </div>
              </div>
            )}

            {/* Blockchain Information */}
            {assetData.blockchainAssetId && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Blockchain Verification</h3>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Blockchain ID:</span>
                      <p className="font-mono">{assetData.blockchainAssetId}</p>
                    </div>
                    {assetData.blockchainTxHash && (
                      <div>
                        <span className="font-medium">Transaction:</span>
                        <p className="font-mono">{formatAddress(assetData.blockchainTxHash)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Carbon Credits */}
            {assetData.carbonCredits > 0 && (
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Environmental Impact</span>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {assetData.carbonCredits} Carbon Credits Earned
                </p>
                <p className="text-xs text-green-600">Contributing to ESG compliance and sustainability</p>
              </div>
            )}

            {/* Owner Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Current Owner</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(assetData.owner)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(assetData.owner)}
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
            This certificate is cryptographically secured and cannot be forged. 
            All asset lifecycle events are recorded immutably for complete transparency.
          </AlertDescription>
        </Alert>

        {/* QR Code */}
        <Card className="max-w-xs mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-sm">Share Certificate</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCodeGenerator 
              value={currentUrl} 
              size={150}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Print Certificate
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}