/**
 * PDF Export Utility for Certificate of Data Destruction
 * Uses a simple approach with template HTML + print styling
 */

export interface CertificateData {
  id: number;
  serialNumber: string;
  model: string;
  status: number;
  ipfsHash?: string;
  technician: string;
  carbonCredits: number;
  registrationTime: number;
  sanitizationTime: number;
  recyclingTime: number;
  ownerAddress: string;
}

/**
 * Generate a PDF-ready HTML document for a certificate
 */
export function generateCertificateHTML(cert: CertificateData): string {
  const sanitizationDate = new Date(cert.sanitizationTime * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sanitizationDateTime = new Date(cert.sanitizationTime * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const registrationDate = new Date(cert.registrationTime * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Data Destruction - ${cert.serialNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background: #f3f4f6;
    }
    
    .container {
      width: 8.5in;
      height: 11in;
      margin: 0.5in auto;
      padding: 1in;
      background: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      page-break-after: always;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #059669;
      padding-bottom: 1in;
      margin-bottom: 0.5in;
    }
    
    .header h1 {
      font-size: 28px;
      color: #059669;
      margin-bottom: 0.2in;
    }
    
    .header p {
      font-size: 12px;
      color: #6b7280;
      margin: 0.1in 0;
    }
    
    .certificate-number {
      text-align: right;
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 0.3in;
      font-family: 'Courier New', monospace;
    }
    
    .content {
      margin-bottom: 0.3in;
    }
    
    .section {
      margin-bottom: 0.3in;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      color: #059669;
      margin-bottom: 0.1in;
      letter-spacing: 1px;
    }
    
    .section-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.2in 0.3in;
      margin-left: 0.2in;
    }
    
    .field {
      margin-bottom: 0.1in;
    }
    
    .field-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.05in;
    }
    
    .field-value {
      font-size: 11px;
      color: #1f2937;
      font-weight: 500;
      word-break: break-all;
    }
    
    .field-value.mono {
      font-family: 'Courier New', monospace;
      font-size: 9px;
    }
    
    .status-badge {
      display: inline-block;
      background: #d1fae5;
      color: #065f46;
      padding: 0.1in 0.2in;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      margin-top: 0.05in;
    }
    
    .ipfs-section {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 0.15in;
      border-radius: 4px;
      margin-bottom: 0.2in;
    }
    
    .ipfs-section-title {
      font-size: 10px;
      font-weight: bold;
      color: #059669;
      margin-bottom: 0.05in;
    }
    
    .ipfs-hash {
      font-family: 'Courier New', monospace;
      font-size: 8px;
      color: #047857;
      word-break: break-all;
      background: white;
      padding: 0.1in;
      border-radius: 2px;
    }
    
    .footer {
      margin-top: 0.3in;
      padding-top: 0.3in;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #6b7280;
    }
    
    .verification-code {
      margin-top: 0.2in;
      text-align: center;
      font-size: 10px;
    }
    
    .verification-code p {
      margin-bottom: 0.05in;
      color: #4b5563;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔐 Certificate of Data Destruction</h1>
      <p>Immutable & Blockchain-Verified</p>
    </div>
    
    <div class="certificate-number">
      Asset ID: ${cert.id} | Serial: ${cert.serialNumber}
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Asset Information -->
      <div class="section">
        <div class="section-title">Asset Information</div>
        <div class="section-content">
          <div class="field">
            <div class="field-label">Serial Number</div>
            <div class="field-value mono">${cert.serialNumber}</div>
          </div>
          <div class="field">
            <div class="field-label">Device Model</div>
            <div class="field-value">${cert.model}</div>
          </div>
        </div>
      </div>
      
      <!-- Status -->
      <div class="section">
        <div class="section-title">Certification Status</div>
        <div class="section-content">
          <div>
            <div class="status-badge">✓ DATA SANITIZED</div>
          </div>
        </div>
      </div>
      
      <!-- Timeline -->
      <div class="section">
        <div class="section-title">Timeline</div>
        <div class="section-content">
          <div class="field">
            <div class="field-label">Registered</div>
            <div class="field-value">${registrationDate}</div>
          </div>
          <div class="field">
            <div class="field-label">Sanitized</div>
            <div class="field-value">${sanitizationDateTime}</div>
          </div>
          ${cert.recyclingTime > 0 ? `
          <div class="field">
            <div class="field-label">Recycled</div>
            <div class="field-value">${new Date(cert.recyclingTime * 1000).toLocaleDateString()}</div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <!-- IPFS Evidence -->
      ${cert.ipfsHash ? `
      <div class="section">
        <div class="section-title">Evidence & Proof</div>
        <div class="ipfs-section">
          <div class="ipfs-section-title">IPFS Hash (Pinata)</div>
          <div class="ipfs-hash">${cert.ipfsHash}</div>
          <p style="font-size: 9px; color: #6b7280; margin-top: 0.05in;">
            Gateway: https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}
          </p>
        </div>
      </div>
      ` : ''}
      
      <!-- Environmental Impact -->
      <div class="section">
        <div class="section-title">Environmental Impact</div>
        <div class="section-content">
          <div class="field">
            <div class="field-label">Carbon Credits Earned</div>
            <div class="field-value">${cert.carbonCredits} Credits</div>
          </div>
          <div class="field">
            <div class="field-label">E-Waste Diverted</div>
            <div class="field-value">Secure Recycling</div>
          </div>
        </div>
      </div>
      
      <!-- Technician & Owner -->
      <div class="section">
        <div class="section-title">Custodians</div>
        <div class="section-content">
          <div class="field">
            <div class="field-label">Technician Address</div>
            <div class="field-value mono" style="font-size: 8px;">${cert.technician}</div>
          </div>
          <div class="field">
            <div class="field-label">Owner Address</div>
            <div class="field-value mono" style="font-size: 8px;">${cert.ownerAddress}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="verification-code">
        <p>🔗 Verify this certificate online at:</p>
        <p style="font-weight: bold; font-family: 'Courier New', monospace;">
          verify.nebulix.app/verify/${cert.serialNumber}
        </p>
      </div>
      <p style="margin-top: 0.2in;">
        ✓ Immutable blockchain record | 🌐 IPFS stored evidence | 📊 Tamper-proof audit trail
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Download certificate as PDF
 * Opens a print dialog to save as PDF
 */
export function downloadCertificatePDF(cert: CertificateData) {
  const html = generateCertificateHTML(cert);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 100);
  };
}

/**
 * Generate QR code link for certificate
 */
export function generateVerifyLink(serialNumber: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}/verify/${encodeURIComponent(serialNumber)}`;
}
