import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from './auth';

export interface AuditableRequest extends AuthRequest {
  auditData?: {
    action: string;
    resource: string;
    resourceId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  };
}

export const auditLog = (action: string, resource: string) => {
  return (req: AuditableRequest, res: Response, next: NextFunction) => {
    // Store audit data for later use
    req.auditData = {
      action,
      resource,
      resourceId: req.params.id || req.body.id || 'unknown'
    };

    // Override res.json to capture response and log audit
    const originalJson = res.json;
    res.json = function(body: any) {
      // Log the audit entry
      logAuditEntry(req, res, body);
      return originalJson.call(this, body);
    };

    next();
  };
};

const logAuditEntry = async (req: AuditableRequest, res: Response, responseBody: any) => {
  try {
    if (!req.auditData || !req.user) return;

    const auditEntry = new AuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: req.auditData.action,
      resource: req.auditData.resource,
      resourceId: req.auditData.resourceId,
      oldValues: req.auditData.oldValues,
      newValues: req.auditData.newValues,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      result: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
      errorMessage: responseBody?.error || undefined,
      blockchainTxHash: responseBody?.data?.txHash || undefined,
      timestamp: new Date()
    });

    await auditEntry.save();
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Don't throw error to avoid breaking the main request
  }
};

export const setAuditData = (req: AuditableRequest, oldValues?: any, newValues?: any) => {
  if (req.auditData) {
    req.auditData.oldValues = oldValues;
    req.auditData.newValues = newValues;
  }
};