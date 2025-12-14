import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@shared/types';
// import { UserRole } from '../../../shared/types';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company?: string;
  walletAddress?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.OPERATOR
  },
  company: {
    type: String,
    trim: true,
    maxlength: 200
  },
  walletAddress: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  permissions: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never return password in JSON
      return ret;
    }
  }
});

// Indexes (email index is created by unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ walletAddress: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
UserSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    switch (this.role) {
      case UserRole.ADMIN:
        this.permissions = [
          'assets:create',
          'assets:read',
          'assets:update',
          'assets:delete',
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'analytics:read',
          'bulk:operations',
          'blockchain:interact'
        ];
        break;
      case UserRole.OPERATOR:
        this.permissions = [
          'assets:create',
          'assets:read',
          'assets:update',
          'analytics:read',
          'blockchain:interact'
        ];
        break;
      case UserRole.ENTERPRISE:
        this.permissions = [
          'assets:read',
          'analytics:read'
        ];
        break;
      case UserRole.AUDITOR:
        this.permissions = [
          'assets:read',
          'analytics:read',
          'audit:read'
        ];
        break;
    }
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);