import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, QrCode, Camera, Loader2 } from 'lucide-react';

/**
 * QR Code Scanner Component
 * Scans QR codes linking to /verify/:serialNumber
 * Automatically navigates to verification page
 */
export function QRCodeScanner() {
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manual serial number entry
  const handleVerify = (serial: string) => {
    if (!serial.trim()) {
      setError('Please enter a serial number');
      return;
    }
    navigate(`/verify/${encodeURIComponent(serial)}`);
  };

  // Start camera stream
  const startScanning = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        // Start QR detection
        detectQRCode();
      }
    } catch (err: any) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera stream
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simple QR detection using library (would need qr-scanner package)
  const detectQRCode = async () => {
    try {
      // For production, use 'qr-scanner' package
      // This is a placeholder - you'll need to install: npm install qr-scanner
      const QrScanner = (window as any).QrScanner;
      
      if (QrScanner && videoRef.current) {
        const scanner = new QrScanner(
          videoRef.current,
          (result: any) => {
            const data = result?.data || '';
            
            // Extract serial number from URL format
            // Expected format: http://localhost:3000/verify/SERIAL-123
            const serialMatch = data.match(/\/verify\/([^/?]+)/);
            if (serialMatch) {
              const serial = decodeURIComponent(serialMatch[1]);
              setLastScanned(serial);
              stopScanning();
              navigate(`/verify/${encodeURIComponent(serial)}`);
            } else if (data.length > 0) {
              // Assume data is a serial number directly
              setLastScanned(data);
              stopScanning();
              navigate(`/verify/${encodeURIComponent(data)}`);
            }
          },
          { returnDetailedScanResult: true, highlightCodeOutline: true }
        );
        
        await scanner.start();
      } else {
        // Fallback: QrScanner not loaded, show manual entry only
        setError('QR Scanner library not loaded. Use manual entry below.');
      }
    } catch (err: any) {
      console.error('QR detection error:', err);
      setError('QR scanning not available. Use manual entry instead.');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Certificate QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="w-full"
              size="lg"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* QR Scanner overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-500 rounded-lg"></div>
                </div>
              </div>
              
              <Button
                onClick={stopScanning}
                variant="destructive"
                className="w-full"
              >
                Stop Scanning
              </Button>
            </>
          )}

          {lastScanned && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Last Scanned</p>
                <p className="text-xs font-mono text-green-700">{lastScanned}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Or Enter Manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Enter serial number (e.g., DEVICE-001)"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify(serialNumber)}
          />
          <Button
            onClick={() => handleVerify(serialNumber)}
            className="w-full"
          >
            Verify Certificate
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        📱 Scan a QR code from a Certificate of Data Destruction or enter the serial number manually
      </p>
    </div>
  );
}
