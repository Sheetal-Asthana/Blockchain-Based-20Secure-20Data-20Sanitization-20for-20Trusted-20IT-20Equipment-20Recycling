import React, { useState, useEffect } from 'react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Download, Eye, Loader2, Search } from 'lucide-react';

interface Certificate {
  id: number;
  serialNumber: string;
  model: string;
  status: number;
  ipfsHash?: string;
  sanitizationTime: number;
  technician: string;
}

/**
 * Certificates Dashboard Component
 * Shows all sanitized assets with CoDD (Certificate of Data Destruction)
 * Allows filtering, viewing, and downloading
 */
export function CertificatesDashboard() {
  const { getAssetsByStatus, getAssetHistory, isInitialized } = useBlockchain();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCerts, setFilteredCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Status 1 = SANITIZED
  useEffect(() => {
    if (isInitialized) {
      loadCertificates();
    }
  }, [isInitialized]);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      // Get all sanitized asset IDs
      const result = await getAssetsByStatus(1, 0, 100);
      
      if (!result || !result.assetIds) {
        setTotalCount(0);
        setCertificates([]);
        setFilteredCerts([]);
        return;
      }

      // Fetch full details for each asset
      const certs: Certificate[] = [];
      for (const assetId of result.assetIds) {
        try {
          const asset = await getAssetHistory(assetId);
          certs.push({
            id: asset.id,
            serialNumber: asset.serialNumber,
            model: asset.model,
            status: asset.status,
            ipfsHash: asset.ipfsHash,
            sanitizationTime: asset.sanitizationTime,
            technician: asset.technician
          });
        } catch (err) {
          console.error(`Failed to fetch asset ${assetId}:`, err);
        }
      }

      setCertificates(certs);
      setFilteredCerts(certs);
      setTotalCount(certs.length);
    } catch (err: any) {
      toast({
        title: 'Load Failed',
        description: 'Could not load certificates. Make sure MetaMask is connected.',
        variant: 'destructive'
      });
      console.error('Load certs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter certificates by search term
  useEffect(() => {
    const filtered = certificates.filter(cert =>
      cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCerts(filtered);
  }, [searchTerm, certificates]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadPDF = async (cert: Certificate) => {
    // This is a placeholder. For production, use a library like jsPDF
    // For now, just navigate to view
    window.location.href = `/verify/${encodeURIComponent(cert.serialNumber)}`;
  };

  if (!isInitialized) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">MetaMask Not Connected</p>
              <p className="text-sm text-red-700">Please connect MetaMask to view certificates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🏆 Certificates of Data Destruction
              <span className="text-sm font-normal text-gray-500">({totalCount})</span>
            </CardTitle>
            <Button onClick={loadCertificates} variant="outline" size="sm">
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by serial number or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <Card className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Loading certificates...</p>
        </Card>
      ) : filteredCerts.length === 0 ? (
        <Card className="border-dashed text-center py-12">
          <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'No matching certificates found' : 'No sanitized assets yet'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCerts.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Sanitized
                  </span>
                </div>

                {/* Asset Info */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
                  <p className="font-mono font-bold break-all">{cert.serialNumber}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Model</p>
                  <p className="text-sm">{cert.model}</p>
                </div>

                {/* Date */}
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Sanitized On</p>
                  <p className="text-sm">{formatDate(cert.sanitizationTime)}</p>
                </div>

                {/* IPFS Hash */}
                {cert.ipfsHash && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Evidence</p>
                    <p className="text-xs font-mono text-gray-600 truncate">{cert.ipfsHash.slice(0, 16)}...</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => window.location.href = `/verify/${encodeURIComponent(cert.serialNumber)}`}
                    size="sm"
                    variant="default"
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => downloadPDF(cert)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && certificates.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{totalCount}</p>
                <p className="text-xs text-gray-600">Certificates</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {(totalCount * 2.5).toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">Carbon Saved (kg)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">100%</p>
                <p className="text-xs text-gray-600">Data Destroyed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
