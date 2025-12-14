import { RequestHandler } from "express";
import { bulkOperationsService } from "../services/BulkOperationsService";
import { notificationService } from "../services/NotificationService";

/**
 * Bulk register assets
 */
export const bulkRegisterAssets: RequestHandler = async (req, res) => {
  try {
    const { assets, options } = req.body;
    
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Assets array is required and must not be empty',
        timestamp: new Date()
      });
    }

    // Validate asset data
    for (const asset of assets) {
      if (!asset.serialNumber || !asset.model) {
        return res.status(400).json({
          success: false,
          error: 'Each asset must have serialNumber and model',
          timestamp: new Date()
        });
      }
    }

    const summary = await bulkOperationsService.bulkRegisterAssets(assets, options);
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk registration',
      timestamp: new Date()
    });
  }
};

/**
 * Bulk prove sanitization
 */
export const bulkProveSanitization: RequestHandler = async (req, res) => {
  try {
    const { sanitizations, options } = req.body;
    
    if (!sanitizations || !Array.isArray(sanitizations) || sanitizations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Sanitizations array is required and must not be empty',
        timestamp: new Date()
      });
    }

    // Validate sanitization data
    for (const sanitization of sanitizations) {
      if (!sanitization.assetId || !sanitization.sanitizationHash) {
        return res.status(400).json({
          success: false,
          error: 'Each sanitization must have assetId and sanitizationHash',
          timestamp: new Date()
        });
      }
    }

    const summary = await bulkOperationsService.bulkProveSanitization(sanitizations, options);
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk sanitization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk sanitization',
      timestamp: new Date()
    });
  }
};

/**
 * Bulk recycle assets
 */
export const bulkRecycleAssets: RequestHandler = async (req, res) => {
  try {
    const { assetIds, options } = req.body;
    
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Asset IDs array is required and must not be empty',
        timestamp: new Date()
      });
    }

    const summary = await bulkOperationsService.bulkRecycleAssets(assetIds, options);
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk recycling error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk recycling',
      timestamp: new Date()
    });
  }
};

/**
 * Import assets from CSV
 */
export const importAssetsFromCSV: RequestHandler = async (req, res) => {
  try {
    const { csvData, options } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required as a string',
        timestamp: new Date()
      });
    }

    const summary = await bulkOperationsService.importAssetsFromCSV(csvData, options);
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import CSV data',
      timestamp: new Date()
    });
  }
};

/**
 * Export assets to CSV
 */
export const exportAssetsToCSV: RequestHandler = async (req, res) => {
  try {
    const { status, startDate, endDate, customer } = req.query;
    
    const filters: any = {};
    
    if (status) {
      filters.status = parseInt(status as string);
    }
    
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      };
    }
    
    if (customer) {
      filters.customer = customer as string;
    }

    const csvData = await bulkOperationsService.exportAssetsToCSV(filters);
    
    // Set headers for CSV download
    const filename = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV data',
      timestamp: new Date()
    });
  }
};

/**
 * Generate bulk sanitization report
 */
export const generateBulkSanitizationReport: RequestHandler = async (req, res) => {
  try {
    const { assetIds, includeIPFSFiles } = req.body;
    
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Asset IDs array is required and must not be empty',
        timestamp: new Date()
      });
    }

    const report = await bulkOperationsService.generateBulkSanitizationReport(
      assetIds, 
      includeIPFSFiles || false
    );
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate bulk sanitization report',
      timestamp: new Date()
    });
  }
};

/**
 * Schedule bulk operation
 */
export const scheduleBulkOperation: RequestHandler = async (req, res) => {
  try {
    const { operation, data, scheduledTime, options } = req.body;
    
    if (!operation || !['register', 'sanitize', 'recycle'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation. Must be register, sanitize, or recycle',
        timestamp: new Date()
      });
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Data array is required and must not be empty',
        timestamp: new Date()
      });
    }
    
    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'Scheduled time is required',
        timestamp: new Date()
      });
    }

    const result = await bulkOperationsService.scheduleBulkOperation(
      operation,
      data,
      new Date(scheduledTime),
      options
    );
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk operation scheduling error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule bulk operation',
      timestamp: new Date()
    });
  }
};

/**
 * Get bulk operation template
 */
export const getBulkOperationTemplate: RequestHandler = async (req, res) => {
  try {
    const { type } = req.params;
    
    let template: string;
    let filename: string;
    
    switch (type) {
      case 'assets':
        template = 'Serial Number,Model,Customer,Location\nDEMO-001,Dell OptiPlex 7090,Acme Corp,Building A\nDEMO-002,HP EliteBook 840,Tech Solutions,Floor 2';
        filename = 'bulk-assets-template.csv';
        break;
      case 'sanitization':
        template = 'Asset ID,Sanitization Hash,Method,Operator\nAST-001,QmX1234567890abcdef,DBAN,John Doe\nAST-002,QmY0987654321fedcba,ATA Secure Erase,Jane Smith';
        filename = 'bulk-sanitization-template.csv';
        break;
      case 'recycling':
        template = 'Asset ID\nAST-001\nAST-002\nAST-003';
        filename = 'bulk-recycling-template.csv';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid template type. Must be assets, sanitization, or recycling',
          timestamp: new Date()
        });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(template);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template',
      timestamp: new Date()
    });
  }
};

/**
 * Validate bulk operation data
 */
export const validateBulkData: RequestHandler = async (req, res) => {
  try {
    const { operation, data } = req.body;
    
    if (!operation || !data) {
      return res.status(400).json({
        success: false,
        error: 'Operation and data are required',
        timestamp: new Date()
      });
    }

    // Mock validation - in production, implement actual validation logic
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate based on operation type
    switch (operation) {
      case 'register':
        data.forEach((asset: any, index: number) => {
          if (!asset.serialNumber) {
            errors.push(`Row ${index + 1}: Serial number is required`);
          }
          if (!asset.model) {
            errors.push(`Row ${index + 1}: Model is required`);
          }
          if (asset.serialNumber && asset.serialNumber.length > 100) {
            warnings.push(`Row ${index + 1}: Serial number is very long`);
          }
        });
        break;
      case 'sanitize':
        data.forEach((sanitization: any, index: number) => {
          if (!sanitization.assetId) {
            errors.push(`Row ${index + 1}: Asset ID is required`);
          }
          if (!sanitization.sanitizationHash) {
            errors.push(`Row ${index + 1}: Sanitization hash is required`);
          }
        });
        break;
      case 'recycle':
        data.forEach((assetId: string, index: number) => {
          if (!assetId || typeof assetId !== 'string') {
            errors.push(`Row ${index + 1}: Valid asset ID is required`);
          }
        });
        break;
    }
    
    res.json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
        totalRows: data.length,
        validRows: data.length - errors.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk data validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate bulk data',
      timestamp: new Date()
    });
  }
};