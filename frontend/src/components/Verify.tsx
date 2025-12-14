import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlockchain } from '@/hooks/useBlockchain';
import { downloadCertificatePDF, generateVerifyLink } from '@/lib/pdf-export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, Shield, Download, Share2, Copy } from 'lucide-react';

/**
 * Verify Component
 * Public route: /verify/:serialNumber
 * Displays Certificate of Data Destruction (CoDD) for a given asset serial number
 */
export function Verify() {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const { verifyAsset, isInitialized } = useBlockchain();

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (serialNumber && isInitialized) {
      loadAsset();
    }
  }, [serialNumber, isInitialized]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!serialNumber) {
        throw new Error('No serial number provided');
      }

      const assetData = await verifyAsset(serialNumber);
      setAsset(assetData);
    } catch (err: any) {
      setError(err.message || 'Asset not found');
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-50 border-yellow-200';
      case 1: return 'bg-green-50 border-green-200';
      case 2: return 'bg-blue-50 border-blue-200';
      case 3: return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { label: 'Registered', color: 'bg-yellow-100 text-yellow-800' };
      case 1: return { label: 'Sanitized', color: 'bg-green-100 text-green-800' };
      case 2: return { label: 'Recycled', color: 'bg-blue-100 text-blue-800' };
      case 3: return { label: 'Sold', color: 'bg-gray-100 text-gray-800' };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'Not yet';
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Web3 Wallet Not Connected</p>
              <p className="text-sm text-red-700">Please connect a Web3 wallet to verify assets.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Loading asset verification...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Verification Failed</p>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-2">Serial Number: {serialNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="font-semibold text-red-900">Asset not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusBadge(asset.status);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Certificate of Data Destruction</h1>
        <p className="text-gray-600">Secure & Immutable Proof on Blockchain</p>
      </div>

      {/* Main CoDD Card */}
      <Card className={`border-2 ${getStatusColor(asset.status)}`}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Verification Certificate
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">ASSET ID</p>
              <p className="font-mono font-bold text-lg">{asset.id}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Asset Information */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Serial Number</p>
              <p className="font-mono font-bold text-lg mt-1">{asset.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Device Model</p>
              <p className="font-semibold text-lg mt-1">{asset.model}</p>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Current Status</p>
            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusInfo.color}`}>
                {asset.status === 1 && '✅'} {statusInfo.label}
              </span>
              {asset.status === 1 && (
                <span className="text-sm text-green-700 font-medium">Data destroyed securely</span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Registered</p>
              <p className="text-sm mt-1">{formatDate(asset.registrationTime)}</p>
            </div>
            {asset.status >= 1 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Sanitized</p>
                <p className="text-sm mt-1">{formatDate(asset.sanitizationTime)}</p>
              </div>
            )}
            {asset.status >= 2 && (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Recycled</p>
                <p className="text-sm mt-1">{formatDate(asset.recyclingTime)}</p>
              </div>
            )}
          </div>

          {/* IPFS Evidence */}
          {asset.ipfsHash && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">Sanitization Evidence (IPFS)</p>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs break-all text-green-700">{asset.ipfsHash}</p>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${asset.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View on IPFS →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Technician Info */}
          {asset.technician && asset.technician !== '0x0000000000000000000000000000000000000000' && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">Technician Address</p>
              <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{asset.technician}</p>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center pt-4 border-t space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Share & Download</p>
            <div className="flex gap-2 w-full pt-2">
              <Button
                onClick={() => {
                  const link = generateVerifyLink(asset.serialNumber);
                  navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Certificate of Data Destruction',
                      text: `Verify asset ${asset.serialNumber}`,
                      url: generateVerifyLink(asset.serialNumber)
                    }).catch(err => console.error('Share failed:', err));
                  }
                }}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                onClick={() => downloadCertificatePDF({
                  id: asset.id,
                  serialNumber: asset.serialNumber,
                  model: asset.model,
                  status: asset.status,
                  ipfsHash: asset.ipfsHash,
                  technician: asset.technician,
                  carbonCredits: 10,
                  registrationTime: asset.registrationTime,
                  sanitizationTime: asset.sanitizationTime,
                  recyclingTime: asset.recyclingTime,
                  ownerAddress: asset.owner
                })}
                size="sm"
                variant="default"
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-2 text-xs text-gray-500">
        <p>🔐 This certificate is immutable and stored on the blockchain</p>
        <p>Evidence preserved on IPFS • Powered by Polygon Amoy Testnet</p>
      </div>
    </div>
  );
}
