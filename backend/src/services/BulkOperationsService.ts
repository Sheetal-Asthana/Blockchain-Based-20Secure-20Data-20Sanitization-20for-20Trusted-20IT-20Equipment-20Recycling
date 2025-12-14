import { AssetStatus } from '../../../shared/types.js';
import { notificationService } from './NotificationService';
import { ipfsService } from './IPFSService';

export interface BulkAssetData {
  serialNumber: string;
  model: string;
  customer?: string;
  location?: string;
}

export interface BulkSanitizationData {
  assetId: string;
  sanitizationHash: string;
  method: string;
  operator: string;
}

export interface BulkOperationResult {
  success: boolean;
  assetId?: string;
  error?: string;
  data?: any;
}

export interface BulkOperationSummary {
  total: number;
  successful: number;
  failed: number;
  results: BulkOperationResult[];
  duration: number;
  startTime: Date;
  endTime: Date;
}

export interface BulkImportOptions {
  skipDuplicates: boolean;
  validateOnly: boolean;
  batchSize: number;
  continueOnError: boolean;
}

export class BulkOperationsService {
  private readonly DEFAULT_BATCH_SIZE = 50;
  private readonly MAX_BATCH_SIZE = 500;

  /**
   * Bulk register assets from CSV/JSON data
   */
  async bulkRegisterAssets(
    assets: BulkAssetData[],
    options: Partial<BulkImportOptions> = {}
  ): Promise<BulkOperationSummary> {
    const startTime = new Date();
    const opts = this.getDefaultOptions(options);
    
    console.log(`Starting bulk asset registration: ${assets.length} assets`);
    
    const results: BulkOperationResult[] = [];
    const batchSize = Math.min(opts.batchSize, this.MAX_BATCH_SIZE);
    
    // Validate data first
    const validationResults = await this.validateAssetData(assets);
    if (validationResults.some(r => !r.success)) {
      console.log('Validation failed for some assets');
      if (!opts.continueOnError) {
        return this.createSummary(startTime, assets.length, validationResults);
      }
    }

    // Process in batches
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(assets.length / batchSize)}`);
      
      const batchResults = await this.processBatchRegistration(batch, opts);
      results.push(...batchResults);
      
      // Add delay between batches to prevent overwhelming the system
      if (i + batchSize < assets.length) {
        await this.delay(1000);
      }
    }

    const summary = this.createSummary(startTime, assets.length, results);
    
    // Send notification
    await notificationService.sendBulkOperationNotification(
      'Asset Registration',
      summary.total,
      { success: summary.successful, failed: summary.failed }
    );

    console.log(`Bulk registration completed: ${summary.successful}/${summary.total} successful`);
    return summary;
  }

  /**
   * Bulk prove sanitization for multiple assets
   */
  async bulkProveSanitization(
    sanitizations: BulkSanitizationData[],
    options: Partial<BulkImportOptions> = {}
  ): Promise<BulkOperationSummary> {
    const startTime = new Date();
    const opts = this.getDefaultOptions(options);
    
    console.log(`Starting bulk sanitization proof: ${sanitizations.length} assets`);
    
    const results: BulkOperationResult[] = [];
    const batchSize = Math.min(opts.batchSize, this.MAX_BATCH_SIZE);
    
    // Process in batches
    for (let i = 0; i < sanitizations.length; i += batchSize) {
      const batch = sanitizations.slice(i, i + batchSize);
      console.log(`Processing sanitization batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sanitizations.length / batchSize)}`);
      
      const batchResults = await this.processBatchSanitization(batch, opts);
      results.push(...batchResults);
      
      if (i + batchSize < sanitizations.length) {
        await this.delay(1000);
      }
    }

    const summary = this.createSummary(startTime, sanitizations.length, results);
    
    await notificationService.sendBulkOperationNotification(
      'Sanitization Proof',
      summary.total,
      { success: summary.successful, failed: summary.failed }
    );

    console.log(`Bulk sanitization proof completed: ${summary.successful}/${summary.total} successful`);
    return summary;
  }

  /**
   * Bulk recycle assets
   */
  async bulkRecycleAssets(
    assetIds: string[],
    options: Partial<BulkImportOptions> = {}
  ): Promise<BulkOperationSummary> {
    const startTime = new Date();
    const opts = this.getDefaultOptions(options);
    
    console.log(`Starting bulk recycling: ${assetIds.length} assets`);
    
    const results: BulkOperationResult[] = [];
    const batchSize = Math.min(opts.batchSize, this.MAX_BATCH_SIZE);
    
    for (let i = 0; i < assetIds.length; i += batchSize) {
      const batch = assetIds.slice(i, i + batchSize);
      console.log(`Processing recycling batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(assetIds.length / batchSize)}`);
      
      const batchResults = await this.processBatchRecycling(batch, opts);
      results.push(...batchResults);
      
      if (i + batchSize < assetIds.length) {
        await this.delay(1000);
      }
    }

    const summary = this.createSummary(startTime, assetIds.length, results);
    
    await notificationService.sendBulkOperationNotification(
      'Asset Recycling',
      summary.total,
      { success: summary.successful, failed: summary.failed }
    );

    console.log(`Bulk recycling completed: ${summary.successful}/${summary.total} successful`);
    return summary;
  }

  /**
   * Import assets from CSV file
   */
  async importAssetsFromCSV(
    csvData: string,
    options: Partial<BulkImportOptions> = {}
  ): Promise<BulkOperationSummary> {
    try {
      const assets = this.parseCSVData(csvData);
      return await this.bulkRegisterAssets(assets, options);
    } catch (error) {
      console.error('CSV import failed:', error);
      throw new Error(`Failed to import CSV: ${error.message}`);
    }
  }

  /**
   * Export assets to CSV
   */
  async exportAssetsToCSV(filters?: {
    status?: AssetStatus;
    dateRange?: { start: Date; end: Date };
    customer?: string;
  }): Promise<string> {
    // Mock implementation - in production, query database
    const assets = this.getMockAssets(filters);
    
    const headers = ['Asset ID', 'Serial Number', 'Model', 'Status', 'Registration Date', 'Sanitization Hash', 'Carbon Credits'];
    const rows = assets.map(asset => [
      asset.id,
      asset.serialNumber,
      asset.model,
      this.getStatusName(asset.status),
      asset.registrationTime,
      asset.sanitizationHash || '',
      asset.carbonCredits
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Generate bulk sanitization report
   */
  async generateBulkSanitizationReport(
    assetIds: string[],
    includeIPFSFiles: boolean = false
  ): Promise<{
    reportHash: string;
    reportUrl: string;
    summary: {
      totalAssets: number;
      sanitizedAssets: number;
      pendingAssets: number;
      complianceRate: number;
    };
  }> {
    console.log(`Generating bulk sanitization report for ${assetIds.length} assets`);
    
    // Mock asset data - in production, query blockchain/database
    const assets = assetIds.map(id => ({
      id,
      serialNumber: `SN-${id}`,
      model: 'Mock Device',
      status: Math.random() > 0.1 ? AssetStatus.SANITIZED : AssetStatus.REGISTERED,
      sanitizationHash: Math.random() > 0.1 ? `Qm${Math.random().toString(36).substr(2, 44)}` : '',
      carbonCredits: Math.random() > 0.1 ? 10 : 0
    }));

    const sanitizedAssets = assets.filter(a => a.status === AssetStatus.SANITIZED);
    const pendingAssets = assets.filter(a => a.status === AssetStatus.REGISTERED);

    const report = {
      reportId: `BULK-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      totalAssets: assets.length,
      sanitizedAssets: sanitizedAssets.length,
      pendingAssets: pendingAssets.length,
      complianceRate: (sanitizedAssets.length / assets.length) * 100,
      assets: assets.map(asset => ({
        ...asset,
        ipfsUrl: asset.sanitizationHash ? ipfsService.getFileUrl(asset.sanitizationHash) : null
      })),
      summary: {
        methods: {
          'DBAN': sanitizedAssets.filter(() => Math.random() > 0.5).length,
          'ATA Secure Erase': sanitizedAssets.filter(() => Math.random() > 0.3).length,
          'Cryptographic Erase': sanitizedAssets.filter(() => Math.random() > 0.7).length
        },
        operators: {
          'John Doe': Math.floor(sanitizedAssets.length * 0.4),
          'Jane Smith': Math.floor(sanitizedAssets.length * 0.3),
          'Bob Johnson': Math.floor(sanitizedAssets.length * 0.3)
        }
      }
    };

    // Upload report to IPFS
    const reportJson = JSON.stringify(report, null, 2);
    const uploadResult = await ipfsService.uploadFile(reportJson, `bulk-report-${report.reportId}.json`, 'application/json');

    return {
      reportHash: uploadResult.hash,
      reportUrl: uploadResult.url,
      summary: {
        totalAssets: report.totalAssets,
        sanitizedAssets: report.sanitizedAssets,
        pendingAssets: report.pendingAssets,
        complianceRate: report.complianceRate
      }
    };
  }

  /**
   * Schedule bulk operations
   */
  async scheduleBulkOperation(
    operation: 'register' | 'sanitize' | 'recycle',
    data: any[],
    scheduledTime: Date,
    options: Partial<BulkImportOptions> = {}
  ): Promise<{ jobId: string; scheduledTime: Date }> {
    const jobId = `BULK-${operation.toUpperCase()}-${Date.now()}`;
    
    console.log(`Scheduled bulk ${operation} operation: ${jobId} for ${scheduledTime.toISOString()}`);
    
    // In production, use a job queue like Bull or Agenda
    setTimeout(async () => {
      try {
        switch (operation) {
          case 'register':
            await this.bulkRegisterAssets(data, options);
            break;
          case 'sanitize':
            await this.bulkProveSanitization(data, options);
            break;
          case 'recycle':
            await this.bulkRecycleAssets(data, options);
            break;
        }
      } catch (error) {
        console.error(`Scheduled bulk operation ${jobId} failed:`, error);
      }
    }, scheduledTime.getTime() - Date.now());

    return { jobId, scheduledTime };
  }

  // Private helper methods
  private async validateAssetData(assets: BulkAssetData[]): Promise<BulkOperationResult[]> {
    return assets.map((asset, index) => {
      const errors: string[] = [];
      
      if (!asset.serialNumber || asset.serialNumber.trim().length === 0) {
        errors.push('Serial number is required');
      }
      
      if (!asset.model || asset.model.trim().length === 0) {
        errors.push('Model is required');
      }
      
      if (asset.serialNumber && asset.serialNumber.length > 100) {
        errors.push('Serial number too long (max 100 characters)');
      }

      return {
        success: errors.length === 0,
        assetId: `${index}`,
        error: errors.length > 0 ? errors.join(', ') : undefined,
        data: asset
      };
    });
  }

  private async processBatchRegistration(
    batch: BulkAssetData[],
    options: BulkImportOptions
  ): Promise<BulkOperationResult[]> {
    const results: BulkOperationResult[] = [];
    
    for (const asset of batch) {
      try {
        // Mock registration - in production, call blockchain service
        const assetId = `AST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        // Simulate potential failure
        if (Math.random() < 0.05 && !options.continueOnError) {
          throw new Error('Random registration failure');
        }
        
        results.push({
          success: true,
          assetId,
          data: { ...asset, id: assetId }
        });
        
        console.log(`Registered asset: ${asset.serialNumber} -> ${assetId}`);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          data: asset
        });
        
        if (!options.continueOnError) {
          break;
        }
      }
    }
    
    return results;
  }

  private async processBatchSanitization(
    batch: BulkSanitizationData[],
    options: BulkImportOptions
  ): Promise<BulkOperationResult[]> {
    const results: BulkOperationResult[] = [];
    
    for (const sanitization of batch) {
      try {
        // Mock sanitization proof - in production, call blockchain service
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        // Simulate potential failure
        if (Math.random() < 0.03 && !options.continueOnError) {
          throw new Error('Sanitization proof failed');
        }
        
        results.push({
          success: true,
          assetId: sanitization.assetId,
          data: { ...sanitization, txHash }
        });
        
        console.log(`Sanitization proved: ${sanitization.assetId} -> ${txHash}`);
      } catch (error) {
        results.push({
          success: false,
          assetId: sanitization.assetId,
          error: error.message,
          data: sanitization
        });
        
        if (!options.continueOnError) {
          break;
        }
      }
    }
    
    return results;
  }

  private async processBatchRecycling(
    batch: string[],
    options: BulkImportOptions
  ): Promise<BulkOperationResult[]> {
    const results: BulkOperationResult[] = [];
    
    for (const assetId of batch) {
      try {
        // Mock recycling - in production, call blockchain service
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const carbonCredits = 10;
        
        // Simulate potential failure
        if (Math.random() < 0.02 && !options.continueOnError) {
          throw new Error('Recycling failed');
        }
        
        results.push({
          success: true,
          assetId,
          data: { assetId, txHash, carbonCredits }
        });
        
        console.log(`Asset recycled: ${assetId} -> ${carbonCredits} credits`);
      } catch (error) {
        results.push({
          success: false,
          assetId,
          error: error.message
        });
        
        if (!options.continueOnError) {
          break;
        }
      }
    }
    
    return results;
  }

  private parseCSVData(csvData: string): BulkAssetData[] {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const serialIndex = headers.findIndex(h => h.includes('serial'));
    const modelIndex = headers.findIndex(h => h.includes('model'));
    const customerIndex = headers.findIndex(h => h.includes('customer'));
    const locationIndex = headers.findIndex(h => h.includes('location'));
    
    if (serialIndex === -1 || modelIndex === -1) {
      throw new Error('CSV must contain serial number and model columns');
    }
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        serialNumber: values[serialIndex],
        model: values[modelIndex],
        customer: customerIndex >= 0 ? values[customerIndex] : undefined,
        location: locationIndex >= 0 ? values[locationIndex] : undefined
      };
    });
  }

  private arrayToCSV(data: any[][]): string {
    return data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    ).join('\n');
  }

  private getMockAssets(filters?: any): any[] {
    // Mock asset data - in production, query database
    return Array.from({ length: 100 }, (_, i) => ({
      id: `AST-${i + 1}`,
      serialNumber: `SN-${i + 1}`,
      model: `Device Model ${i % 5 + 1}`,
      status: i % 4,
      registrationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sanitizationHash: i % 4 > 0 ? `Qm${Math.random().toString(36).substr(2, 44)}` : '',
      carbonCredits: i % 4 === 2 ? 10 : 0
    }));
  }

  private getStatusName(status: number): string {
    const statusNames = ['Registered', 'Sanitized', 'Recycled', 'Sold'];
    return statusNames[status] || 'Unknown';
  }

  private createSummary(startTime: Date, total: number, results: BulkOperationResult[]): BulkOperationSummary {
    const endTime = new Date();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      total,
      successful,
      failed,
      results,
      duration: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime
    };
  }

  private getDefaultOptions(options: Partial<BulkImportOptions>): BulkImportOptions {
    return {
      skipDuplicates: options.skipDuplicates ?? true,
      validateOnly: options.validateOnly ?? false,
      batchSize: options.batchSize ?? this.DEFAULT_BATCH_SIZE,
      continueOnError: options.continueOnError ?? true
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const bulkOperationsService = new BulkOperationsService();