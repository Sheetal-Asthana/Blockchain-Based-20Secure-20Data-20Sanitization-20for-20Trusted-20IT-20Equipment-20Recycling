import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnect } from "@/components/WalletConnect";
import { AssetRegistration } from "@/components/AssetRegistration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wallet, 
  Plus, 
  Search, 
  Shield, 
  Recycle, 
  ArrowRightLeft,
  Leaf,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy
} from "lucide-react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { Asset, AssetStatus } from "@/lib/blockchain";

export default function Blockchain() {
  const { 
    wallet, 
    getAssetHistory, 
    proveSanitization, 
    recycleAsset, 
    transferAsset,
    getTotalAssets,
    isLoading, 
    error 
  } = useBlockchain();

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<Asset | null>(null);
  const [sanitizationHash, setSanitizationHash] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [totalAssets, setTotalAssets] = useState<bigint | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.isConnected) {
      loadTotalAssets();
    }
  }, [wallet.isConnected]);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    try {
      setActionLoading("search");
      const asset = await getAssetHistory(BigInt(searchId));
      setSearchResult(asset);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResult(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProveSanitization = async () => {
    if (!searchResult || !sanitizationHash.trim()) return;
    
    try {
      setActionLoading("sanitize");
      const txHash = await proveSanitization(searchResult.id, sanitizationHash);
      if (txHash) {
        setSanitizationHash("");
        // Refresh asset data
        await handleSearch();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecycle = async () => {
    if (!searchResult) return;
    
    try {
      setActionLoading("recycle");
      const txHash = await recycleAsset(searchResult.id);
      if (txHash) {
        // Refresh asset data
        await handleSearch();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransfer = async () => {
    if (!searchResult || !transferAddress.trim()) return;
    
    try {
      setActionLoading("transfer");
      const txHash = await transferAsset(searchResult.id, transferAddress);
      if (txHash) {
        setTransferAddress("");
        // Refresh asset data
        await handleSearch();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const loadTotalAssets = async () => {
    const total = await getTotalAssets();
    setTotalAssets(total);
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.REGISTERED:
        return <Badge variant="secondary">Registered</Badge>;
      case AssetStatus.SANITIZED:
        return <Badge variant="default" className="bg-blue-500">Sanitized</Badge>;
      case AssetStatus.RECYCLED:
        return <Badge variant="outline" className="border-green-500 text-green-700">Recycled</Badge>;
      case AssetStatus.SOLD:
        return <Badge variant="destructive">Sold</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0n) return "Not set";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const getExplorerUrl = (address: string) => {
    if (wallet.chainId === 11155111) {
      return `https://sepolia.etherscan.io/address/${address}`;
    } else if (wallet.chainId === 80001) {
      return `https://mumbai.polygonscan.com/address/${address}`;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Blockchain IT Asset Manager</h1>
        <p className="text-muted-foreground">
          Secure, transparent, and immutable IT equipment recycling with proof of data sanitization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Blockchain Security</p>
                <p className="text-xs text-muted-foreground">Immutable records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Carbon Credits</p>
                <p className="text-xs text-muted-foreground">ESG compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Proof of Sanitization</p>
                <p className="text-xs text-muted-foreground">Verified data wipe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Recycle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Assets</p>
                <p className="text-lg font-bold">{totalAssets?.toString() || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register" className="space-y-4">
          <div className="flex justify-center">
            <AssetRegistration />
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Asset Search & Verification
              </CardTitle>
              <CardDescription>
                Search for asset details and verify sanitization status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Asset ID (e.g., 1, 2, 3...)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  type="number"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={!searchId.trim() || actionLoading === "search"}
                >
                  {actionLoading === "search" ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Asset #{searchResult.id.toString()}</span>
                      {getStatusBadge(searchResult.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Serial Number</Label>
                        <p className="text-sm">{searchResult.serialNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Model</Label>
                        <p className="text-sm">{searchResult.model}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Owner</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{formatAddress(searchResult.owner)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(searchResult.owner)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {getExplorerUrl(searchResult.owner) && (
                            <a
                              href={getExplorerUrl(searchResult.owner)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Carbon Credits</Label>
                        <p className="text-sm">{searchResult.carbonCredits.toString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sanitization Hash</Label>
                      {searchResult.sanitizationHash ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                            {searchResult.sanitizationHash}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(searchResult.sanitizationHash)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No sanitization proof recorded</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium">Registered</Label>
                        <p className="text-xs">{formatTimestamp(searchResult.registrationTime)}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Sanitized</Label>
                        <p className="text-xs">{formatTimestamp(searchResult.sanitizationTime)}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Recycled</Label>
                        <p className="text-xs">{formatTimestamp(searchResult.recyclingTime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-4">
          {!wallet.isConnected ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Connect your wallet to manage assets</p>
              </CardContent>
            </Card>
          ) : !searchResult ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Search for an asset first to manage it</p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Prove Sanitization */}
              {searchResult.status === AssetStatus.REGISTERED && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Prove Data Sanitization
                    </CardTitle>
                    <CardDescription>
                      Upload proof that the device has been securely wiped
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sanitizationHash">Sanitization Hash (IPFS/SHA256)</Label>
                      <Textarea
                        id="sanitizationHash"
                        placeholder="Enter IPFS hash (QmX...) or SHA256 hash of the wipe log"
                        value={sanitizationHash}
                        onChange={(e) => setSanitizationHash(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleProveSanitization}
                      disabled={!sanitizationHash.trim() || actionLoading === "sanitize"}
                      className="w-full"
                    >
                      {actionLoading === "sanitize" ? "Proving..." : "Prove Sanitization"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recycle Asset */}
              {searchResult.status === AssetStatus.SANITIZED && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Recycle className="h-5 w-5" />
                      Recycle Asset
                    </CardTitle>
                    <CardDescription>
                      Mark asset as recycled and earn carbon credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleRecycle}
                      disabled={actionLoading === "recycle"}
                      className="w-full"
                    >
                      {actionLoading === "recycle" ? "Recycling..." : "Recycle Asset (+10 Carbon Credits)"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Transfer Asset */}
              {(searchResult.status === AssetStatus.SANITIZED || searchResult.status === AssetStatus.RECYCLED) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5" />
                      Transfer Asset
                    </CardTitle>
                    <CardDescription>
                      Transfer ownership to another address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="transferAddress">New Owner Address</Label>
                      <Input
                        id="transferAddress"
                        placeholder="0x..."
                        value={transferAddress}
                        onChange={(e) => setTransferAddress(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleTransfer}
                      disabled={!transferAddress.trim() || actionLoading === "transfer"}
                      className="w-full"
                    >
                      {actionLoading === "transfer" ? "Transferring..." : "Transfer Asset"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Asset Already Sold */}
              {searchResult.status === AssetStatus.SOLD && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Asset Sold</p>
                    <p className="text-muted-foreground">This asset has been transferred and is no longer manageable</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}