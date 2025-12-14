import mongoose, { Document, Schema } from 'mongoose';
import { AssetStatus } from '../../../shared/types.js';

export interface IAsset extends Document {
  id: string;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash?: string;
  carbonCredits: number;
  owner: string;
  customer?: string;
  location?: string;
  registrationTime: Date;
  sanitizationTime?: Date;
  recyclingTime?: Date;
  blockchainTxHash?: string;
  blockchainAssetId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3], // AssetStatus values: REGISTERED=0, SANITIZED=1, RECYCLED=2, SOLD=3
    default: AssetStatus.REGISTERED
  },
  sanitizationHash: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validate IPFS hash format (CIDv0 or CIDv1)
        return !v || /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58})$/.test(v);
      },
      message: 'Invalid IPFS hash format'
    }
  },
  carbonCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  owner: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Validate Ethereum address format
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  customer: {
    type: String,
    trim: true,
    maxlength: 200
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  registrationTime: {
    type: Date,
    default: Date.now
  },
  sanitizationTime: {
    type: Date
  },
  recyclingTime: {
    type: Date
  },
  blockchainTxHash: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Validate transaction hash format
        return !v || /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  blockchainAssetId: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance (serialNumber and blockchainAssetId indexes created by unique: true)
AssetSchema.index({ status: 1 });
AssetSchema.index({ owner: 1 });
AssetSchema.index({ customer: 1 });
AssetSchema.index({ registrationTime: -1 });

// Pre-save middleware
AssetSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case AssetStatus.SANITIZED:
        if (!this.sanitizationTime) {
          this.sanitizationTime = now;
        }
        break;
      case AssetStatus.RECYCLED:
        if (!this.recyclingTime) {
          this.recyclingTime = now;
        }
        if (this.carbonCredits === 0) {
          this.carbonCredits = 10; // Default carbon credits for recycling
        }
        break;
    }
  }
  next();
});

// Static methods interface
interface IAssetModel extends mongoose.Model<IAsset> {
  findBySerialNumber(serialNumber: string): Promise<IAsset | null>;
  findByStatus(status: AssetStatus): Promise<IAsset[]>;
  findByOwner(owner: string): Promise<IAsset[]>;
  getStatusCounts(): Promise<Array<{ _id: number; count: number }>>;
}

// Static methods
AssetSchema.statics.findBySerialNumber = function(serialNumber: string) {
  return this.findOne({ serialNumber });
};

AssetSchema.statics.findByStatus = function(status: AssetStatus) {
  return this.find({ status });
};

AssetSchema.statics.findByOwner = function(owner: string) {
  return this.find({ owner });
};

AssetSchema.statics.getStatusCounts = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export const Asset = mongoose.model<IAsset, IAssetModel>('Asset', AssetSchema);