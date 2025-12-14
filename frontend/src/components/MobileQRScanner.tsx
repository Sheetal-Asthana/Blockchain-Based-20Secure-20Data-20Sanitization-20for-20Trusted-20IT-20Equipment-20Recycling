import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone,
  Download,
  Share2,
  Eye,
  X
} from "lucide-react";

interface ScannedAsset {
  id: string;
  serialNumber: string;
  model: string;
  status: string;
  sanitizationHash?: string;
  carbonCredits: number;
  lastUpdated: Date;
}

interface QRCodeData {
  assetId: string;
  type: 'asset' | 'certificate';
  url?: string;
  metadata?: any;
}

export default function MobileQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<ScannedAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
      setError('Camera access is required for QR code scanning. Please enable camera permissions.');
      return false;
    }
  };

  const startScanning = async () => {
    setError(null);
    
    if (cameraPermission !== 'granted') {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }
    
    setIsScanning(true);
    
    // Start QR code detection
    detectQRCode();
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraPermission('prompt');
  };

  const detectQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(detectQRCode);
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Mock QR code detection - in production, use a QR code library like jsQR
    if (Math.random() < 0.1) { // 10% chance to "detect" QR code for demo
      const mockQRData: QRCodeData = {
        assetId: `AST-${Math.floor(Math.random() * 1000)}`,
        type: 'asset',
        url: `${window.location.origin}/verify?id=AST-${Math.floor(Math.random() * 1000)}`
      };
      
      handleQRCodeDetected(mockQRData);
      return;
    }
    
    // Continue scanning
    requestAnimationFrame(detectQRCode);
  };

  const handleQRCodeDetected = async (qrData: QRCodeData) => {
    setIsScanning(false);
    
    try {
      // Mock asset lookup - in production, call API
      const mockAsset: ScannedAsset = {
        id: qrData.assetId,
        serialNumber: `SN-${qrData.assetId}`,
        model: 'Dell OptiPlex 7090',
        status: Math.random() > 0.5 ? 'Sanitized' : 'Registered',
        sanitizationHash: Math.random() > 0.5 ? `Qm${Math.random().toString(36).substr(2, 44)}` : undefined,
        carbonCredits: Math.random() > 0.5 ? 10 : 0,
        lastUpdated: new Date()
      };
      
      setScannedAsset(mockAsset);
      
      // Stop camera
      stopScanning();
    } catch (error) {
      console.error('Failed to lookup asset:', error);
      setError('Failed to retrieve asset information. Please try again.');
    }
  };

  const generateQRCode = async (assetId: string) => {
    try {
      // Mock QR code generation - in production, use a QR code library
      const qrData = {
        assetId,
        type: 'asset',
        url: `${window.location.origin}/verify?id=${assetId}`,
        timestamp: new Date().toISOString()
      };
      
      // Create a simple QR code representation
      const qrString = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black">
            ${assetId}
          </text>
        </svg>
      `)}`;
      
      setGeneratedQR(qrString);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    }
  };

  const shareAsset = async (asset: ScannedAsset) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Asset ${asset.serialNumber}`,
          text: `IT Asset: ${asset.model} - Status: ${asset.status}`,
          url: `${window.location.origin}/verify?id=${asset.id}`
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Asset ${asset.serialNumber} (${asset.model}) - Status: ${asset.status}\n${window.location.origin}/verify?id=${asset.id}`;
      await navigator.clipboard.writeText(shareText);
      alert('Asset information copied to clipboard!');
    }
  };

  const downloadCertificate = (asset: ScannedAsset) => {
    // Mock certificate download
    const certificate = {
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      model: asset.model,
      status: asset.status,
      sanitizationHash: asset.sanitizationHash,
      carbonCredits: asset.carbonCredits,
      generatedAt: new Date().toISOString(),
      verificationUrl: `${window.location.origin}/verify?id=${asset.id}`
    };
    
    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${asset.serialNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Mobile QR Scanner</h1>
        <p className="text-muted-foreground">
          Scan QR codes to instantly verify asset sanitization and certificates
        </p>
      </div>

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Point your camera at a QR code to scan asset information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cameraPermission === 'denied' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera access denied. Please enable camera permissions in your browser settings.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            {isScanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg border"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button onClick={stopScanning} variant="destructive" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Stop Scanning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Ready to scan QR codes</p>
                <Button onClick={startScanning}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scanned Asset Information */}
      {scannedAsset && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Asset Scanned Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Asset ID</Label>
                <p className="text-sm">{scannedAsset.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Serial Number</Label>
                <p className="text-sm">{scannedAsset.serialNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Model</Label>
                <p className="text-sm">{scannedAsset.model}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={scannedAsset.status === 'Sanitized' ? 'default' : 'secondary'}>
                  {scannedAsset.status}
                </Badge>
              </div>
            </div>

            {scannedAsset.sanitizationHash && (
              <div>
                <Label className="text-sm font-medium">Sanitization Proof</Label>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {scannedAsset.sanitizationHash}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Carbon Credits</Label>
                <p className="text-sm">{scannedAsset.carbonCredits}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm">{scannedAsset.lastUpdated.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => shareAsset(scannedAsset)} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => downloadCertificate(scannedAsset)} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Certificate
              </Button>
              <Button onClick={() => generateQRCode(scannedAsset.id)} variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR
              </Button>
              <Button 
                onClick={() => window.open(`/verify?id=${scannedAsset.id}`, '_blank')} 
                variant="outline" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated QR Code */}
      {generatedQR && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
            <CardDescription>
              Share this QR code for easy asset verification
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <img src={generatedQR} alt="Generated QR Code" className="mx-auto border rounded" />
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedQR;
                  link.download = `qr-code-${scannedAsset?.id || 'asset'}.svg`;
                  link.click();
                }}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setGeneratedQR(null)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-specific features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Offline Capability</h4>
              <p className="text-sm text-muted-foreground">
                Scan and store asset data offline, sync when connected
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Batch Scanning</h4>
              <p className="text-sm text-muted-foreground">
                Scan multiple assets quickly for bulk operations
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">GPS Location</h4>
              <p className="text-sm text-muted-foreground">
                Automatically tag assets with location data
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Voice Notes</h4>
              <p className="text-sm text-muted-foreground">
                Add voice annotations to scanned assets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Start Scanning" to activate your camera</li>
            <li>Point your camera at a QR code on an asset or certificate</li>
            <li>Wait for the automatic detection and scanning</li>
            <li>View the asset information and verification status</li>
            <li>Use the action buttons to share, download, or view details</li>
            <li>Generate new QR codes for assets as needed</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}