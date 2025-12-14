import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Recycle,
  QrCode,
  Upload
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { AssetStatus, UserRole } from "../../../shared/types";
import Layout from "@/components/Layout";

interface Asset {
  _id: string;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  registrationTime: string;
  sanitizationHash?: string;
  carbonCredits?: number;
  customer?: string;
  location?: string;
}

interface Analytics {
  totalAssets: number;
  sanitizedAssets: number;
  recycledAssets: number;
  carbonCreditsEarned: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [customer, setCustomer] = useState("");
  const [location, setLocation] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sanitizationFile, setSanitizationFile] = useState<File | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load assets
      const assetsResponse = await apiService.getAssets(1, 20);
      if (assetsResponse.success && assetsResponse.data && Array.isArray(assetsResponse.data)) {
        setAssets(assetsResponse.data);
      }

      // Load analytics
      const analyticsResponse = await apiService.get<Analytics>('/assets/stats/overview');
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber || !model) return;

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await apiService.createAsset({
        serialNumber: serialNumber.trim(),
        model: model.trim(),
        customer: customer.trim() || user?.company || 'Unknown',
        location: location.trim() || 'Warehouse'
      });

      if (response.success) {
        setSuccess(`Asset ${serialNumber} registered successfully on blockchain!`);
        setSerialNumber("");
        setModel("");
        setCustomer("");
        setLocation("");
        loadDashboardData(); // Refresh data
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      console.error('Asset registration failed:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSanitizeAsset = async (asset: Asset) => {
    if (!sanitizationFile) {
      setError("Please select a sanitization log file");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Upload file to IPFS first
      const formData = new FormData();
      formData.append('file', sanitizationFile);
      formData.append('assetId', asset._id);
      formData.append('serialNumber', asset.serialNumber);

      const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ipfs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'File upload failed');
      }

      // Prove sanitization with IPFS hash
      const sanitizationResponse = await apiService.post(`/assets/${asset._id}/sanitization`, {
        sanitizationHash: uploadData.data.hash,
        method: 'Cryptographic Erase',
        operator: user?.name || 'Unknown',
        notes: 'Sanitization completed with IPFS proof'
      });

      if (sanitizationResponse.success) {
        setSuccess(`Asset ${asset.serialNumber} sanitized successfully! IPFS Hash: ${uploadData.data.hash}`);
        setSelectedAsset(null);
        setSanitizationFile(null);
        loadDashboardData();
        
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      console.error('Sanitization failed:', error);
      setError(error instanceof Error ? error.message : 'Sanitization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecycleAsset = async (asset: Asset) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await apiService.post(`/assets/${asset._id}/recycle`);

      if (response.success && response.data && typeof response.data === 'object' && 'asset' in response.data) {
        const assetData = response.data as { asset: Asset };
        setSuccess(`Asset ${asset.serialNumber} recycled successfully! Earned ${assetData.asset.carbonCredits} carbon credits.`);
        loadDashboardData();
        
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      console.error('Recycling failed:', error);
      setError(error instanceof Error ? error.message : 'Recycling failed');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = (asset: Asset) => {
    const verificationUrl = `${window.location.origin}/verify/${asset._id}`;
    // Create a new window with QR code and asset details
    const qrWindow = window.open('', '_blank', 'width=400,height=500');
    if (qrWindow) {
      qrWindow.document.write(`
        <html>
          <head>
            <title>Asset QR Code - ${asset.serialNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .asset-info { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
              .qr-code { margin: 20px 0; }
              .verification-url { word-break: break-all; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h2>Asset Verification QR Code</h2>
            <div class="asset-info">
              <strong>Serial Number:</strong> ${asset.serialNumber}<br>
              <strong>Model:</strong> ${asset.model}<br>
              <strong>Status:</strong> ${asset.status === AssetStatus.SANITIZED ? 'Sanitized' : asset.status === AssetStatus.RECYCLED ? 'Recycled' : 'Registered'}
            </div>
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}" alt="QR Code" />
            </div>
            <div class="verification-url">
              <strong>Verification URL:</strong><br>
              ${verificationUrl}
            </div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
          </body>
        </html>
      `);
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    const statusConfig = {
      [AssetStatus.REGISTERED]: { label: "Registered", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      [AssetStatus.SANITIZED]: { label: "Sanitized", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      [AssetStatus.RECYCLED]: { label: "Recycled", variant: "outline" as const, color: "bg-green-100 text-green-800" },
      [AssetStatus.SOLD]: { label: "Sold", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status] || { label: "Unknown", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getStatusActions = (asset: Asset) => {
    const actions = [];
    
    if (asset.status === AssetStatus.REGISTERED) {
      actions.push(
        <Button
          key="sanitize"
          size="sm"
          variant="outline"
          onClick={() => setSelectedAsset(asset)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Shield className="w-3 h-3 mr-1" />
          Sanitize
        </Button>
      );
    }
    
    if (asset.status === AssetStatus.SANITIZED) {
      actions.push(
        <Button
          key="recycle"
          size="sm"
          variant="outline"
          onClick={() => handleRecycleAsset(asset)}
          className="text-green-600 hover:text-green-800"
        >
          <Recycle className="w-3 h-3 mr-1" />
          Recycle
        </Button>
      );
    }
    
    if (asset.status === AssetStatus.RECYCLED || asset.status === AssetStatus.SANITIZED) {
      actions.push(
        <Button
          key="qr"
          size="sm"
          variant="outline"
          onClick={() => generateQRCode(asset)}
          className="text-purple-600 hover:text-purple-800"
        >
          <QrCode className="w-3 h-3 mr-1" />
          QR Code
        </Button>
      );
    }
    
    return actions;
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Layout userRole={user.role} userName={user.name} onLogout={logout}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IT Asset Sanitization Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name} ({user.role}) - {user.company}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAssets || 0}</div>
                <p className="text-xs text-muted-foreground">Registered in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sanitized</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.sanitizedAssets || 0}</div>
                <p className="text-xs text-muted-foreground">Data wiped securely</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recycled</CardTitle>
                <Recycle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.recycledAssets || 0}</div>
                <p className="text-xs text-muted-foreground">Ready for resale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.carbonCreditsEarned || 0}</div>
                <p className="text-xs text-muted-foreground">Environmental impact</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Asset Registration Form */}
        {(user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New Asset
              </CardTitle>
              <CardDescription>
                Add a new IT asset to the blockchain registry for secure tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterAsset} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g., DELL-XPS-123456"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g., XPS 15 9520"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input
                      id="customer"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      placeholder={user?.company || "Customer name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Warehouse A"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Asset
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sanitization Modal */}
        {selectedAsset && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                Sanitize Asset: {selectedAsset.serialNumber}
              </CardTitle>
              <CardDescription>
                Upload sanitization log file to prove secure data wiping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sanitizationFile">Sanitization Log File</Label>
                <Input
                  id="sanitizationFile"
                  type="file"
                  accept=".txt,.log,.pdf,.json"
                  onChange={(e) => setSanitizationFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload proof of sanitization (log files, screenshots, certificates)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSanitizeAsset(selectedAsset)}
                  disabled={!sanitizationFile || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading to IPFS...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Prove Sanitization
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAsset(null);
                    setSanitizationFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Registry</CardTitle>
            <CardDescription>
              All registered assets with their current status and available actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No assets registered yet</p>
                <p className="text-sm text-muted-foreground">Register your first asset above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{asset.serialNumber}</span>
                        {getStatusBadge(asset.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{asset.model}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.customer} • {asset.location} • {new Date(asset.registrationTime).toLocaleDateString()}
                      </p>
                      {asset.sanitizationHash && (
                        <p className="text-xs text-blue-600">
                          IPFS: {asset.sanitizationHash.substring(0, 20)}...
                        </p>
                      )}
                      {asset.carbonCredits && (
                        <p className="text-xs text-green-600">
                          Carbon Credits: {asset.carbonCredits}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {getStatusActions(asset)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
