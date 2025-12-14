// Shared API interfaces between client and server

export interface DemoResponse {
  message: string;
  timestamp: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    company?: string;
    walletAddress?: string;
    permissions: string[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
  };
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  company?: string;
  walletAddress?: string;
}

export interface AssetCreateRequest {
  serialNumber: string;
  model: string;
  customer?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface AssetResponse {
  id: string;
  serialNumber: string;
  model: string;
  status: number;
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

export interface BlockchainStatusResponse {
  available: boolean;
  network: {
    name: string;
    chainId: number;
  } | null;
  contractAddress: string | null;
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

export interface AnalyticsResponse {
  totalAssets: number;
  sanitizedAssets: number;
  recycledAssets: number;
  carbonCreditsEarned: number;
  complianceRate: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    user: string;
    details: string;
  }>;
  statusDistribution: {
    registered: number;
    sanitized: number;
    recycled: number;
    sold: number;
  };
  monthlyTrends: Array<{
    month: string;
    registered: number;
    sanitized: number;
    recycled: number;
  }>;
}

export interface ESGMetricsResponse {
  carbonCreditsEarned: number;
  co2Reduction: number;
  materialsRecycled: number;
  energySaved: number;
  wasteReduced: number;
  complianceRate: number;
  certifications: string[];
  reportingPeriod: {
    start: Date;
    end: Date;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: Date;
  requestId?: string;
}