export type UUID = string;

export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: Date | null;
  isDeleted: boolean;
}

export interface AuditableEntity extends SoftDeletableEntity {
  createdBy: UUID | null;
  updatedBy: UUID | null;
  deletedBy: UUID | null;
}

export interface TenantScopedEntity extends AuditableEntity {
  tenantId: UUID;
}

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface FileUploadResult {
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}
