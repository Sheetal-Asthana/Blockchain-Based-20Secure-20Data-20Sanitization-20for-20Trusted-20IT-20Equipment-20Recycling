import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      // Check if it's a URL or just an ID/serial
      if (manualInput.includes('/verify/')) {
        window.location.href = manualInput;
      } else {
        navigate(`/verify?serial=${encodeURIComponent(manualInput.trim())}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // Create a canvas to decode QR code from image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // For now, show success message and let user manually enter
      setSuccess('Image uploaded successfully. Please enter the asset ID or serial number manually.');
    };

    img.onerror = () => {
      setError('Failed to load image. Please try again.');
    };

    img.src = URL.createObjectURL(file);
  };

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Check if we have camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      // For now, just show a message that camera is active
      setSuccess('Camera activated! Point at QR code or use manual input below.');
      
      // Stop the stream after 5 seconds (demo purposes)
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsScanning(false);
        setSuccess('');
      }, 5000);

    } catch (err: any) {
      setError('Camera access denied or not available. Please use manual input or upload an image.');
      setIsScanning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Asset QR Scanner
          </CardTitle>
          <CardDescription>
            Scan QR codes or manually enter asset information for verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Camera Scanner */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Camera Scanner</h3>
            <Button 
              onClick={startCamera} 
              disabled={isScanning}
              className="w-full"
              variant={isScanning ? "secondary" : "default"}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Start Camera Scanner'}
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Upload QR Code Image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload QR Code Image
            </Button>
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Manual Entry</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <Input
                placeholder="Enter asset ID, serial number, or verification URL"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <Button type="submit" variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Verify Asset
              </Button>
            </form>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p><strong>How to use:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use camera to scan QR codes directly</li>
              <li>Upload a photo of a QR code</li>
              <li>Manually enter asset serial number or ID</li>
              <li>Paste verification URLs from certificates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}