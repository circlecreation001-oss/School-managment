import { UUID, EntityStatus } from './common.types';

export interface TenantContext {
  tenantId: UUID;
  institutionId?: UUID;
  branchId?: UUID;
  slug: string;
  domain?: string;
  status: TenantStatus;
  plan?: string;
  features: string[];
}

export type TenantStatus = 'trial' | 'active' | 'suspended' | 'expired' | 'cancelled' | 'archived';

export interface TenantBranding {
  tenantId: UUID;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  appName: string;
  domain?: string;
  subdomain?: string;
}

export interface TenantSettings {
  tenantId: UUID;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  academicSessionId?: UUID;
}

export interface InstitutionSummary {
  id: UUID;
  tenantId: UUID;
  name: string;
  code: string;
  status: EntityStatus;
}

export interface BranchSummary {
  id: UUID;
  institutionId: UUID;
  name: string;
  code: string;
  status: EntityStatus;
}
