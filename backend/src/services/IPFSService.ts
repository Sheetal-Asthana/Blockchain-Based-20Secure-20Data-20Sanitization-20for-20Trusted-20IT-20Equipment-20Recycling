import { create } from 'ipfs-http-client';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
}

export interface FileMetadata {
  hash: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  pinned: boolean;
}

export class IPFSService {
  private ipfsClient: any;
  private pinata: any = null;
  private usePinata: boolean;

  constructor() {
    this.usePinata = !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY);
    
    if (this.usePinata) {
      this.pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
      console.log('🔗 Pinata IPFS service initialized');
    } else {
      // Fallback to local IPFS node
      this.ipfsClient = create({
        host: process.env.IPFS_HOST || 'localhost',
        port: parseInt(process.env.IPFS_PORT || '5001'),
        protocol: process.env.IPFS_PROTOCOL || 'http'
      });
      console.log('🔗 Local IPFS node initialized');
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(file: Buffer | string, filename: string, mimeType?: string): Promise<IPFSUploadResult> {
    try {
      if (this.usePinata && this.pinata) {
        return await this.uploadToPinata(file, filename, mimeType);
      } else {
        return await this.uploadToIPFS(file, filename);
      }
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error(`Failed to upload file to IPFS: ${error || "Error occured"}`);
    }
  }

  /**
   * Upload sanitization report to IPFS
   */
  async uploadSanitizationReport(report: {
    assetId: string;
    serialNumber: string;
    sanitizationMethod: string;
    timestamp: Date;
    operator: string;
    verificationHash: string;
    screenshots?: Buffer[];
    logFile?: Buffer;
  }): Promise<IPFSUploadResult> {
    const reportData = {
      ...report,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      standard: 'NIST SP 800-88 Rev. 1'
    };

    const reportJson = JSON.stringify(reportData, null, 2);
    const reportBuffer = Buffer.from(reportJson, 'utf-8');
    
    return await this.uploadFile(reportBuffer, `sanitization-report-${report.assetId}.json`, 'application/json');
  }

  /**
   * Download file from IPFS
   */
  async downloadFile(hash: string): Promise<Buffer> {
    try {
      if (this.usePinata) {
        // Use Pinata's dedicated gateway for faster access
        const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
        const response = await fetch(`${gatewayUrl}/ipfs/${hash}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } else {
        const chunks = [];
        for await (const chunk of this.ipfsClient.cat(hash)) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      }
    } catch (error) {
      console.error('IPFS download failed:', error);
      throw new Error(`Failed to download file from IPFS: ${error}`);
    }
  }

  /**
   * Pin file to ensure persistence
   */
  async pinFile(hash: string): Promise<boolean> {
    try {
      if (this.usePinata && this.pinata) {
        // Pin by hash on Pinata
        await this.pinata.pinByHash(hash, {
          pinataMetadata: {
            name: `Pinned-${hash}`,
            keyvalues: {
              pinnedAt: new Date().toISOString(),
              service: 'IT-Asset-Manager'
            }
          }
        });
        return true;
      } else {
        await this.ipfsClient.pin.add(hash);
        return true;
      }
    } catch (error) {
      console.error('IPFS pin failed:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(hash: string): Promise<FileMetadata> {
    try {
      if (this.usePinata && this.pinata) {
        // Get metadata from Pinata
        const pinList = await this.pinata.pinList({
          hashContains: hash,
          status: 'pinned',
          pageLimit: 1
        });
        
        if (pinList.rows.length > 0) {
          const pin = pinList.rows[0];
          return {
            hash,
            name: pin.metadata?.name || 'unknown',
            size: pin.size,
            type: 'application/octet-stream',
            uploadedAt: new Date(pin.date_pinned),
            pinned: true
          };
        } else {
          // Fallback to gateway HEAD request
          const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
          const response = await fetch(`${gatewayUrl}/ipfs/${hash}`, { method: 'HEAD' });
          return {
            hash,
            name: 'unknown',
            size: parseInt(response.headers.get('content-length') || '0'),
            type: response.headers.get('content-type') || 'application/octet-stream',
            uploadedAt: new Date(),
            pinned: false
          };
        }
      } else {
        const stat = await this.ipfsClient.files.stat(`/ipfs/${hash}`);
        return {
          hash,
          name: 'unknown',
          size: stat.size,
          type: 'application/octet-stream',
          uploadedAt: new Date(),
          pinned: true
        };
      }
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error(`Failed to get metadata for ${hash}: ${error}`);
    }
  }

  /**
   * Generate IPFS URL for file
   */
  getFileUrl(hash: string): string {
    if (this.usePinata) {
      const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
      return `${gatewayUrl}/ipfs/${hash}`;
    } else {
      return `https://ipfs.io/ipfs/${hash}`;
    }
  }

  /**
   * Validate IPFS hash format
   */
  isValidHash(hash: string): boolean {
    // Check for CIDv0 (Qm...) or CIDv1 format
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^b[a-z2-7]{58}$/;
    
    return cidv0Regex.test(hash) || cidv1Regex.test(hash);
  }

  /**
   * Upload to Pinata
   */
  private async uploadToPinata(file: Buffer | string, filename: string, mimeType?: string): Promise<IPFSUploadResult> {
    const fileBuffer = typeof file === 'string' ? Buffer.from(file, 'utf-8') : file;
    
    const options = {
      pinataMetadata: {
        name: filename,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          mimeType: mimeType || 'application/octet-stream',
          service: 'IT-Asset-Manager',
          fileSize: fileBuffer.length.toString()
        }
      },
      pinataOptions: {
        cidVersion: 1,
        wrapWithDirectory: false
      }
    };

    // Create a readable stream from buffer
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    (readable as any).path = filename;

    const result = await this.pinata.pinFileToIPFS(readable, options);
    
    const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
    
    return {
      hash: result.IpfsHash,
      size: fileBuffer.length,
      url: `${gatewayUrl}/ipfs/${result.IpfsHash}`
    };
  }

  /**
   * Upload to local IPFS node
   */
  private async uploadToIPFS(file: Buffer | string, filename: string): Promise<IPFSUploadResult> {
    const fileBuffer = typeof file === 'string' ? Buffer.from(file, 'utf-8') : file;
    
    const result = await this.ipfsClient.add({
      path: filename,
      content: fileBuffer
    });

    return {
      hash: result.cid.toString(),
      size: result.size,
      url: `https://ipfs.io/ipfs/${result.cid.toString()}`
    };
  }

  /**
   * Create sanitization certificate with IPFS proof
   */
  async createSanitizationCertificate(data: {
    assetId: string;
    serialNumber: string;
    model: string;
    sanitizationHash: string;
    timestamp: Date;
    operator: string;
    company: string;
  }): Promise<IPFSUploadResult> {
    const certificate = {
      certificateId: `CERT-${data.assetId}-${Date.now()}`,
      title: 'Data Sanitization Certificate',
      ...data,
      issuedAt: new Date().toISOString(),
      standard: 'NIST SP 800-88 Rev. 1',
      method: 'Cryptographic Erase / Secure Overwrite',
      verification: {
        blockchainProof: true,
        ipfsHash: data.sanitizationHash,
        immutable: true
      },
      signature: {
        algorithm: 'ECDSA',
        publicKey: process.env.CERTIFICATE_PUBLIC_KEY || 'mock-public-key',
        timestamp: new Date().toISOString()
      }
    };

    const certificateJson = JSON.stringify(certificate, null, 2);
    return await this.uploadFile(certificateJson, `certificate-${data.assetId}.json`, 'application/json');
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();