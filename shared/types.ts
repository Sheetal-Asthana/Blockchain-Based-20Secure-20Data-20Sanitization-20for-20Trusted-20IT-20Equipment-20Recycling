// Shared types between client and server

export enum AssetStatus {
  REGISTERED = 0,
  SANITIZED = 1,
  RECYCLED = 2,
  SOLD = 3
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  ENTERPRISE = 'enterprise',
  AUDITOR = 'auditor'
}

export enum SanitizationMethod {
  DBAN = 'dban',
  ATA_SECURE_ERASE = 'ata',
  CRYPTOGRAPHIC_ERASE = 'crypto',
  PHYSICAL_DESTRUCTION = 'physical'
}

export interface Asset {
  id: string;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash?: string;
  carbonCredits: number;
  owner: string;
  registrationTime: Date;
  sanitizationTime?: Date;
  recyclingTime?: Date;
  customer?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface SanitizationLog {
  id: string;
  assetId: string;
  method: SanitizationMethod;
  operator: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  verificationHash?: string;
  ipfsHash?: string;
  screenshots?: string[];
  logFile?: string;
  standard: string;
  passes?: number;
  notes?: string;
}

export interface Certificate {
  id: string;
  assetId: string;
  certificateType: 'sanitization' | 'recycling' | 'destruction';
  issuedTo: string;
  issuedBy: string;
  issueDate: Date;
  expiryDate?: Date;
  blockchainTxHash?: string;
  ipfsHash?: string;
  qrCode?: string;
  status: 'active' | 'revoked' | 'expired';
  metadata?: Record<string, any>;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  result: 'success' | 'failure';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  standard: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: Record<string, any>;
  actions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ESGMetrics {
  carbonCreditsEarned: number;
  co2Reduction: number; // in tons
  materialsRecycled: number; // in tons
  energySaved: number; // in MWh
  wasteReduced: number; // in tons
  complianceRate: number; // percentage
  certifications: string[];
  reportingPeriod: {
    start: Date;
    end: Date;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BulkOperationRequest {
  operation: 'register' | 'sanitize' | 'recycle' | 'transfer';
  data: any[];
  options?: {
    skipDuplicates?: boolean;
    validateOnly?: boolean;
    batchSize?: number;
    continueOnError?: boolean;
  };
}

export interface BulkOperationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    data: any;
  }>;
  startTime: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down' | 'degraded';
    blockchain: 'up' | 'down' | 'degraded';
    ipfs: 'up' | 'down' | 'degraded';
    email: 'up' | 'down' | 'degraded';
    storage: 'up' | 'down' | 'degraded';
  };
  metrics: {
    uptime: number; // in seconds
    responseTime: number; // in ms
    errorRate: number; // percentage
    throughput: number; // requests per minute
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
  };
  lastCheck: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
  signature?: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'email' | 'slack' | 'teams';
  endpoint?: string;
  credentials?: Record<string, string>;
  events: string[];
  isActive: boolean;
  lastSync?: Date;
  syncStatus?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

// Blockchain Integration Types
export interface BlockchainStatus {
  available: boolean;
  network: {
    name: string;
    chainId: number;
  } | null;
  contractAddress: string | null;
}

export interface BlockchainAsset {
  id: number;
  serialNumber: string;
  model: string;
  status: AssetStatus;
  sanitizationHash: string;
  carbonCredits: number;
  owner: string;
  registrationTime: number;
  sanitizationTime: number;
  recyclingTime: number;
}

export interface SerialNumberCheck {
  exists: boolean;
  serialNumber: string;
}

export interface AssetsByStatus {
  status: number;
  offset: number;
  limit: number;
  assetIds: number[];
  count: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API endpoint types
export interface AssetCreateRequest {
  serialNumber: string;
  model: string;
  customer?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface AssetUpdateRequest {
  model?: string;
  customer?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface SanitizationRequest {
  assetId: string;
  method: SanitizationMethod;
  operator: string;
  standard?: string;
  passes?: number;
  notes?: string;
}

export interface CertificateRequest {
  assetId: string;
  certificateType: 'sanitization' | 'recycling' | 'destruction';
  issuedTo: string;
  metadata?: Record<string, any>;
}

// Filter and search types
export interface AssetFilters {
  status?: AssetStatus[];
  customer?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  result?: 'success' | 'failure';
}

// Configuration types
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    port: number;
    baseUrl: string;
  };
  database: {
    url: string;
    maxConnections: number;
    ssl: boolean;
  };
  blockchain: {
    network: string;
    contractAddress: string;
    rpcUrl: string;
    gasLimit: number;
  };
  storage: {
    provider: 'local' | 's3' | 'gcs';
    bucket?: string;
    region?: string;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    from: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiry: string;
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
  features: {
    enableBlockchain: boolean;
    enableNotifications: boolean;
    enableAuditLog: boolean;
    enableBulkOperations: boolean;
    enableMobileApp: boolean;
  };
}