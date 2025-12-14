import express, { RequestHandler } from "express";
import { analyticsService } from "../services/AnalyticsService";

/**
 * Get analytics dashboard data
 */
export const getAnalyticsDashboard: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const dashboard = await analyticsService.getAnalyticsDashboard(dateRange);
    
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load analytics dashboard',
      timestamp: new Date()
    });
  }
};

/**
 * Get real-time metrics
 */
export const getRealTimeMetrics: RequestHandler = async (req, res) => {
  try {
    const metrics = await analyticsService.getRealTimeMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Real-time metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load real-time metrics',
      timestamp: new Date()
    });
  }
};

/**
 * Generate ESG report
 */
export const generateESGReport: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
        timestamp: new Date()
      });
    }

    const period = {
      start: new Date(startDate),
      end: new Date(endDate)
    };

    const report = await analyticsService.generateESGReport(period);
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('ESG report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ESG report',
      timestamp: new Date()
    });
  }
};

/**
 * Generate compliance report
 */
export const generateComplianceReport: RequestHandler = async (req, res) => {
  try {
    const { period } = req.params;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        error: 'Period parameter is required',
        timestamp: new Date()
      });
    }

    const report = await analyticsService.generateComplianceReport(period);
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Compliance report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate compliance report',
      timestamp: new Date()
    });
  }
};

/**
 * Export analytics data
 */
export const exportAnalyticsData: RequestHandler = async (req, res) => {
  try {
    const { format, type } = req.params;
    
    if (!['csv', 'pdf', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Must be csv, pdf, or json',
        timestamp: new Date()
      });
    }

    if (!['dashboard', 'esg', 'compliance'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be dashboard, esg, or compliance',
        timestamp: new Date()
      });
    }

    const data = await analyticsService.exportAnalyticsData(format as any, type as any);
    
    // Set appropriate headers for file download
    const filename = `analytics-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', getContentType(format));
    
    res.send(data);
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data',
      timestamp: new Date()
    });
  }
};

/**
 * Get processing trends
 */
export const getProcessingTrends: RequestHandler = async (req, res) => {
  try {
    const { period } = req.query;
    
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    const selectedPeriod = validPeriods.includes(period as string) ? period as any : 'monthly';

    const trends = await analyticsService.getProcessingTrends(selectedPeriod);
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Processing trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load processing trends',
      timestamp: new Date()
    });
  }
};

/**
 * Get device type analytics
 */
export const getDeviceTypeAnalytics: RequestHandler = async (req, res) => {
  try {
    const analytics = await analyticsService.getDeviceTypeAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Device type analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load device type analytics',
      timestamp: new Date()
    });
  }
};

/**
 * Get sanitization method analytics
 */
export const getSanitizationMethodAnalytics: RequestHandler = async (req, res) => {
  try {
    const analytics = await analyticsService.getSanitizationMethodAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Sanitization method analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load sanitization method analytics',
      timestamp: new Date()
    });
  }
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const metrics = await analyticsService.getPerformanceMetrics(dateRange);
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load performance metrics',
      timestamp: new Date()
    });
  }
};

/**
 * Get environmental impact metrics
 */
export const getEnvironmentalImpact: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const impact = await analyticsService.getEnvironmentalImpact(dateRange);
    
    res.json({
      success: true,
      data: impact,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Environmental impact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load environmental impact metrics',
      timestamp: new Date()
    });
  }
};

/**
 * Get predictive analytics
 */
export const getPredictiveAnalytics: RequestHandler = async (req, res) => {
  try {
    const analytics = await analyticsService.getPredictiveAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load predictive analytics',
      timestamp: new Date()
    });
  }
};

// Helper function to get content type for file downloads
function getContentType(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

// Build an Express router so this module can be used as a default import
const router = express.Router();

router.get('/', getAnalyticsDashboard);
router.get('/realtime', getRealTimeMetrics);
router.post('/esg', generateESGReport);
router.get('/compliance/:period', generateComplianceReport);
router.get('/export/:format/:type', exportAnalyticsData);
router.get('/trends', getProcessingTrends);
router.get('/devices', getDeviceTypeAnalytics);
router.get('/sanitization-methods', getSanitizationMethodAnalytics);
router.get('/performance', getPerformanceMetrics);
router.get('/environmental-impact', getEnvironmentalImpact);
router.get('/predictive', getPredictiveAnalytics);

export default router;