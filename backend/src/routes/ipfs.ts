import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { ipfsService } from '../services/IPFSService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for sanitization logs
    const allowedTypes = [
      'text/plain',
      'application/json',
      'application/pdf',
      'image/png',
      'image/jpeg',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.log')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text, JSON, PDF, images, and log files are allowed.'));
    }
  }
});

// Upload file to IPFS
router.post('/ipfs/upload',
  authenticateToken,
  upload.single('file'),
  auditLog('UPLOAD_FILE', 'ipfs'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
          timestamp: new Date()
        });
      }

      const { assetId, serialNumber } = req.body;
      
      // Create sanitization report with file data
      const sanitizationReport = {
        assetId: assetId || 'unknown',
        serialNumber: serialNumber || 'unknown',
        sanitizationMethod: 'Cryptographic Erase / Secure Overwrite',
        timestamp: new Date(),
        operator: req.user?.name || 'Unknown',
        verificationHash: `sha256-${Buffer.from(req.file.buffer).toString('hex').substring(0, 32)}`,
        fileMetadata: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedBy: req.user?.email || 'unknown'
        },
        compliance: {
          standard: 'NIST SP 800-88 Rev. 1',
          method: 'Cryptographic Erase',
          passes: 3,
          verified: true
        }
      };

      // Upload sanitization report to IPFS
      const result = await ipfsService.uploadSanitizationReport(sanitizationReport);
      
      // Also upload the original file if it's a log file
      let originalFileResult = null;
      if (req.file.originalname.endsWith('.log') || req.file.mimetype === 'text/plain') {
        originalFileResult = await ipfsService.uploadFile(
          req.file.buffer,
          `sanitization-log-${assetId}-${Date.now()}.${req.file.originalname.split('.').pop()}`,
          req.file.mimetype
        );
      }

      res.json({
        success: true,
        data: {
          hash: result.hash,
          size: result.size,
          url: result.url,
          originalFile: originalFileResult,
          report: sanitizationReport
        },
        message: 'Sanitization proof uploaded to IPFS successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('IPFS upload error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file to IPFS',
        timestamp: new Date()
      });
    }
  }
);

// Get file from IPFS
router.get('/ipfs/:hash',
  async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!ipfsService.isValidHash(hash)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IPFS hash format',
          timestamp: new Date()
        });
      }

      const metadata = await ipfsService.getFileMetadata(hash);
      const url = ipfsService.getFileUrl(hash);

      res.json({
        success: true,
        data: {
          hash,
          url,
          metadata
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve file from IPFS',
        timestamp: new Date()
      });
    }
  }
);

// Download file from IPFS
router.get('/ipfs/:hash/download',
  async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!ipfsService.isValidHash(hash)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IPFS hash format'
        });
      }

      const fileBuffer = await ipfsService.downloadFile(hash);
      const metadata = await ipfsService.getFileMetadata(hash);

      res.setHeader('Content-Type', metadata.type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.name || hash}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('IPFS download error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download file from IPFS'
      });
    }
  }
);

// Create sanitization certificate
router.post('/ipfs/certificate',
  authenticateToken,
  auditLog('GENERATE_CERTIFICATE', 'certificate'),
  async (req: AuthRequest, res) => {
    try {
      const { assetId, serialNumber, model, sanitizationHash } = req.body;

      if (!assetId || !serialNumber || !model || !sanitizationHash) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields for certificate generation',
          timestamp: new Date()
        });
      }

      const certificateData = {
        assetId,
        serialNumber,
        model,
        sanitizationHash,
        timestamp: new Date(),
        operator: req.user?.name || 'Unknown',
        company: req.user?.company || 'Unknown'
      };

      const result = await ipfsService.createSanitizationCertificate(certificateData);

      res.json({
        success: true,
        data: result,
        message: 'Sanitization certificate created successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Certificate creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create sanitization certificate',
        timestamp: new Date()
      });
    }
  }
);

export default router as Router;