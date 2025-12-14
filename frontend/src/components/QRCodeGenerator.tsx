interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 200, className = '' }: QRCodeGeneratorProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <img 
      src={qrCodeUrl}
      alt="QR Code"
      className={className}
      style={{ width: size, height: size, maxWidth: '100%', height: 'auto' }}
    />
  );
}