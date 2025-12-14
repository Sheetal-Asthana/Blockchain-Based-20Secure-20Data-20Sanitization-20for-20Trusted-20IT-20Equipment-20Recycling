import { Router, type Router as ExpressRouter } from 'express';
import { Asset } from '../models/Asset';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { auditLog, setAuditData, AuditableRequest } from '../middleware/audit';
import { AssetStatus } from '../../../shared/types.js';
import { blockchainService } from '../services/BlockchainService';
import { ipfsService } from '../services/IPFSService';
import { notificationService } from '../services/NotificationService';

const router: ExpressRouter = Router();

// Get all assets with filtering and pagination
router.get('/', 
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = {};
      
      if (req.query.status) {
        filter.status = parseInt(req.query.status as string);
      }
      
      if (req.query.customer) {
        filter.customer = new RegExp(req.query.customer as string, 'i');
      }
      
      if (req.query.search) {
        filter.$or = [
          { serialNumber: new RegExp(req.query.search as string, 'i') },
          { model: new RegExp(req.query.search as string, 'i') }
        ];
      }

      if (req.query.startDate || req.query.endDate) {
        filter.registrationTime = {};
        if (req.query.startDate) {
          filter.registrationTime.$gte = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
          filter.registrationTime.$lte = new Date(req.query.endDate as string);
        }
      }

      const [assets, total] = await Promise.all([
        Asset.find(filter)
          .sort({ registrationTime: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Asset.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get assets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assets',
        timestamp: new Date()
      });
    }
  }
);

// Get single asset by ID
router.get('/:id',
  authenticateToken,
  requirePermission('assets:read'),
  async (req, res) => {
    try {
      const asset = await Asset.findById(req.params.id);
      
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: asset,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve asset',
        timestamp: new Date()
      });
    }
  }
);

// Create new asset (temporary - no auth for testing)
router.post('/test',
  async (req, res) => {
    try {
      const { serialNumber, model, customer, location, owner } = req.body;

      // Validate required fields
      if (!serialNumber || !model) {
        return res.status(400).json({
          success: false,
          error: 'Serial number and model are required',
          timestamp: new Date()
        });
      }

      // Check for duplicate serial number
      const existingAsset = await Asset.findBySerialNumber(serialNumber);
      if (existingAsset) {
        return res.status(409).json({
          success: false,
          error: 'Asset with this serial number already exists',
          timestamp: new Date()
        });
      }

      // Create asset in database
      const defaultWallet = '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4';
      
      console.log('Creating asset with data:', {
        serialNumber,
        model,
        customer: customer || 'Test Customer',
        location: location || 'Test Location',
        owner: owner || defaultWallet,
        status: AssetStatus.REGISTERED,
        statusValue: AssetStatus.REGISTERED
      });

      const asset = new Asset({
        serialNumber,
        model,
        customer: customer || 'Test Customer',
        location: location || 'Test Location',
        owner: owner || defaultWallet,
        status: AssetStatus.REGISTERED
      });

      console.log('Asset before save:', asset.toJSON());
      await asset.save();
      console.log('Asset after save:', asset.toJSON());

      res.status(201).json({
        success: true,
        data: { asset },
        message: 'Asset registered successfully (test mode)',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Create asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create asset: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date()
      });
    }
  }
);

// Create new asset
router.post('/',
  authenticateToken,
  requirePermission('assets:create'),
  auditLog('CREATE_ASSET', 'asset'),
  async (req: AuditableRequest, res) => {
    try {
      const { serialNumber, model, customer, location, owner } = req.body;

      // Validate required fields
      if (!serialNumber || !model) {
        return res.status(400).json({
          success: false,
          error: 'Serial number and model are required',
          timestamp: new Date()
        });
      }

      // Check for duplicate serial number
      const existingAsset = await Asset.findBySerialNumber(serialNumber);
      if (existingAsset) {
        return res.status(409).json({
          success: false,
          error: 'Asset with this serial number already exists',
          timestamp: new Date()
        });
      }

      // Create asset in database
      const defaultWallet = '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4';
      const asset = new Asset({
        serialNumber,
        model,
        customer,
        location,
        owner: owner || req.user?.walletAddress || defaultWallet,
        status: AssetStatus.REGISTERED
      });

      await asset.save();

      // Register on blockchain if enabled
      let blockchainResult = null;
      if (process.env.ENABLE_BLOCKCHAIN === 'true') {
        try {
          blockchainResult = await blockchainService.registerAsset(serialNumber, model);
          asset.blockchainTxHash = blockchainResult.txHash;
          asset.blockchainAssetId = blockchainResult.assetId.toString();
          await asset.save();
        } catch (blockchainError) {
          console.error('Blockchain registration failed:', blockchainError);
          // Continue without blockchain - asset is still created in database
        }
      }

      // Set audit data
      setAuditData(req, undefined, asset.toJSON());

      // Send notification
      await notificationService.sendAssetRegistrationNotification({
        assetId: asset.id,
        serialNumber: asset.serialNumber,
        model: asset.model,
        operator: req.user?.name || 'Unknown',
        timestamp: asset.registrationTime
      });

      res.status(201).json({
        success: true,
        data: {
          asset,
          blockchain: blockchainResult
        },
        message: 'Asset registered successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Create asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create asset',
        timestamp: new Date()
      });
    }
  }
);

// Prove sanitization
router.post('/:id/sanitization',
  authenticateToken,
  requirePermission('assets:update'),
  auditLog('PROVE_SANITIZATION', 'asset'),
  async (req: AuditableRequest, res) => {
    try {
      const { sanitizationHash, method, operator, notes } = req.body;

      if (!sanitizationHash) {
        return res.status(400).json({
          success: false,
          error: 'Sanitization hash is required',
          timestamp: new Date()
        });
      }

      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          timestamp: new Date()
        });
      }

      if (asset.status !== AssetStatus.REGISTERED) {
        return res.status(400).json({
          success: false,
          error: 'Asset must be in registered status to prove sanitization',
          timestamp: new Date()
        });
      }

      const oldValues = asset.toJSON();

      // Update asset
      asset.status = AssetStatus.SANITIZED;
      asset.sanitizationHash = sanitizationHash;
      asset.sanitizationTime = new Date();

      // Prove sanitization on blockchain if enabled
      let blockchainResult = null;
      if (process.env.ENABLE_BLOCKCHAIN === 'true' && asset.blockchainAssetId) {
        try {
          blockchainResult = await blockchainService.proveSanitization(
            BigInt(asset.blockchainAssetId),
            sanitizationHash
          );
          asset.blockchainTxHash = blockchainResult;
        } catch (blockchainError) {
          console.error('Blockchain sanitization proof failed:', blockchainError);
        }
      }

      await asset.save();

      // Set audit data
      setAuditData(req, oldValues, asset.toJSON());

      // Send notification
      await notificationService.sendSanitizationCompletionNotification({
        assetId: asset.id,
        serialNumber: asset.serialNumber,
        model: asset.model,
        sanitizationHash,
        operator: operator || req.user?.name || 'Unknown',
        timestamp: asset.sanitizationTime
      });

      res.json({
        success: true,
        data: {
          asset,
          blockchain: blockchainResult
        },
        message: 'Sanitization proved successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Prove sanitization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prove sanitization',
        timestamp: new Date()
      });
    }
  }
);

// Recycle asset
router.post('/:id/recycle',
  authenticateToken,
  requirePermission('assets:update'),
  auditLog('RECYCLE_ASSET', 'asset'),
  async (req: AuditableRequest, res) => {
    try {
      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          timestamp: new Date()
        });
      }

      if (asset.status !== AssetStatus.SANITIZED) {
        return res.status(400).json({
          success: false,
          error: 'Asset must be sanitized before recycling',
          timestamp: new Date()
        });
      }

      const oldValues = asset.toJSON();

      // Update asset
      asset.status = AssetStatus.RECYCLED;
      asset.carbonCredits = 10; // Default carbon credits
      asset.recyclingTime = new Date();

      // Recycle on blockchain if enabled
      let blockchainResult = null;
      if (process.env.ENABLE_BLOCKCHAIN === 'true' && asset.blockchainAssetId) {
        try {
          blockchainResult = await blockchainService.recycleAsset(BigInt(asset.blockchainAssetId));
          asset.blockchainTxHash = blockchainResult;
        } catch (blockchainError) {
          console.error('Blockchain recycling failed:', blockchainError);
        }
      }

      await asset.save();

      // Set audit data
      setAuditData(req, oldValues, asset.toJSON());

      // Send notification
      await notificationService.sendRecyclingNotification({
        assetId: asset.id,
        serialNumber: asset.serialNumber,
        model: asset.model,
        carbonCredits: asset.carbonCredits,
        timestamp: asset.recyclingTime
      });

      res.json({
        success: true,
        data: {
          asset,
          blockchain: blockchainResult
        },
        message: 'Asset recycled successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Recycle asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to recycle asset',
        timestamp: new Date()
      });
    }
  }
);

// Transfer asset
router.post('/:id/transfer',
  authenticateToken,
  requirePermission('assets:update'),
  auditLog('TRANSFER_ASSET', 'asset'),
  async (req: AuditableRequest, res) => {
    try {
      const { newOwner } = req.body;

      if (!newOwner) {
        return res.status(400).json({
          success: false,
          error: 'New owner address is required',
          timestamp: new Date()
        });
      }

      const asset = await Asset.findById(req.params.id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          timestamp: new Date()
        });
      }

      if (asset.status !== AssetStatus.SANITIZED && asset.status !== AssetStatus.RECYCLED) {
        return res.status(400).json({
          success: false,
          error: 'Asset must be sanitized or recycled before transfer',
          timestamp: new Date()
        });
      }

      const oldValues = asset.toJSON();

      // Update asset
      const previousOwner = asset.owner;
      asset.owner = newOwner;
      asset.status = AssetStatus.SOLD;

      // Transfer on blockchain if enabled
      let blockchainResult = null;
      if (process.env.ENABLE_BLOCKCHAIN === 'true' && asset.blockchainAssetId) {
        try {
          blockchainResult = await blockchainService.transferAsset(
            BigInt(asset.blockchainAssetId),
            newOwner
          );
          asset.blockchainTxHash = blockchainResult;
        } catch (blockchainError) {
          console.error('Blockchain transfer failed:', blockchainError);
        }
      }

      await asset.save();

      // Set audit data
      setAuditData(req, oldValues, asset.toJSON());

      res.json({
        success: true,
        data: {
          asset,
          blockchain: blockchainResult
        },
        message: 'Asset transferred successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Transfer asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transfer asset',
        timestamp: new Date()
      });
    }
  }
);

// Get asset statistics
router.get('/stats/overview',
  authenticateToken,
  requirePermission('analytics:read'),
  async (req, res) => {
    try {
      const [statusCounts, totalCarbonCredits, recentAssets] = await Promise.all([
        Asset.getStatusCounts(),
        Asset.aggregate([
          { $group: { _id: null, total: { $sum: '$carbonCredits' } } }
        ]),
        Asset.find()
          .sort({ registrationTime: -1 })
          .limit(5)
          .lean()
      ]);

      const stats = {
        totalAssets: statusCounts.reduce((sum: number, item: any) => sum + item.count, 0),
        sanitizedAssets: statusCounts.find((item: any) => item._id === AssetStatus.SANITIZED)?.count || 0,
        recycledAssets: statusCounts.find((item: any) => item._id === AssetStatus.RECYCLED)?.count || 0,
        carbonCreditsEarned: totalCarbonCredits[0]?.total || 0,
        statusCounts: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentAssets
      };

      res.json({
        success: true,
        data: stats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get asset stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve asset statistics',
        timestamp: new Date()
      });
    }
  }
);

export default router;