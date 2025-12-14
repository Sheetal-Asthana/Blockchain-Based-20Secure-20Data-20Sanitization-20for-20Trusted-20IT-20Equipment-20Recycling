import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { blockchainService } from '../services/BlockchainService';

const router = Router();

// Get blockchain status
router.get('/status',
  async (req, res) => {
    try {
      const status = blockchainService.getStatus();
      const networkInfo = await blockchainService.getNetworkInfo();
      
      res.json({
        success: true,
        data: {
          ...status,
          network: networkInfo
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Blockchain status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get blockchain status',
        timestamp: new Date()
      });
    }
  }
);

// Get total assets from blockchain
router.get('/assets/total',
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const total = await blockchainService.getTotalAssets();
      
      res.json({
        success: true,
        data: { total },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get total assets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get total assets from blockchain',
        timestamp: new Date()
      });
    }
  }
);

// Get asset from blockchain
router.get('/assets/:id',
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      if (isNaN(assetId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid asset ID',
          timestamp: new Date()
        });
      }

      const asset = await blockchainService.getAsset(assetId);
      
      res.json({
        success: true,
        data: asset,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get blockchain asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get asset from blockchain',
        timestamp: new Date()
      });
    }
  }
);

// Check if serial number exists on blockchain
router.get('/check-serial/:serialNumber',
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const { serialNumber } = req.params;
      const exists = await blockchainService.serialNumberExists(serialNumber);
      
      res.json({
        success: true,
        data: { exists, serialNumber },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Check serial number error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check serial number',
        timestamp: new Date()
      });
    }
  }
);

// Get assets by status from blockchain
router.get('/assets-by-status/:status',
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const status = parseInt(req.params.status);
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(status) || status < 0 || status > 3) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status value',
          timestamp: new Date()
        });
      }

      const assetIds = await blockchainService.getAssetsByStatus(status, offset, limit);
      
      res.json({
        success: true,
        data: {
          status,
          offset,
          limit,
          assetIds,
          count: assetIds.length
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get assets by status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get assets by status',
        timestamp: new Date()
      });
    }
  }
);

export default router;