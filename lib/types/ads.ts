export type AdStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "STOPPED"
  | "REJECTED"
  | "PENDING_REVIEW";

export interface AdMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  conversions?: number;
  engagement?: number;
  reach?: number;
  frequency?: number;
}

export interface AdResponse {
  id: string;
  adSetId: string;
  creativeId: string;
  name: string;
  status: AdStatus;
  targeting?: unknown;
  schedule?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics?: AdMetrics;
  performance?: AdMetrics;
}

export interface CreateAdRequest {
  adSetId: string;
  creativeId: string;
  name: string;
  targeting?: unknown;
  schedule?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
}

export interface UpdateAdRequest {
  name?: string;
  creativeId?: string;
  targeting?: unknown;
  schedule?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
}

export interface UpdateAdStatusRequest {
  status: AdStatus;
}

export interface BulkUpdateAdStatusRequest {
  adIds: string[];
  status: AdStatus;
  confirm?: boolean;
}


