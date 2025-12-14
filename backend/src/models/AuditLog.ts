import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  errorMessage?: string;
  blockchainTxHash?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_ASSET',
      'UPDATE_ASSET',
      'DELETE_ASSET',
      'PROVE_SANITIZATION',
      'RECYCLE_ASSET',
      'TRANSFER_ASSET',
      'LOGIN',
      'LOGOUT',
      'BULK_OPERATION',
      'GENERATE_CERTIFICATE',
      'VIEW_ANALYTICS'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['asset', 'user', 'certificate', 'analytics', 'bulk_operation']
  },
  resourceId: {
    type: String,
    required: true
  },
  oldValues: {
    type: Schema.Types.Mixed
  },
  newValues: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  errorMessage: {
    type: String
  },
  blockchainTxHash: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We use custom timestamp field
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ result: 1, timestamp: -1 });

// TTL index to automatically delete old audit logs (optional)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);