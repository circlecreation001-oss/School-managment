import { AppError } from '../../utils/errors.js';
import { prisma } from '@erp/database';
import { materialRepository } from './material.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreateMaterialInput, UpdateMaterialInput, MaterialListQuery } from './material.schema.js';

export class MaterialService {
  async list(tenantId: string, query: MaterialListQuery) {
    const { data, total } = await materialRepository.list(tenantId, query);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async getById(tenantId: string, id: string) {
    const m = await materialRepository.getById(id);
    if (!m || m.tenantId !== tenantId || m.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Material not found');
    return m;
  }

  async create(tenantId: string, teacherId: string | null, input: CreateMaterialInput, actorId: string) {
    const material = await materialRepository.create({ tenantId, teacherId, ...input });
    await this.audit(tenantId, actorId, 'study_material', material.id, 'create');
    return material;
  }

  async update(tenantId: string, id: string, input: UpdateMaterialInput, actorId: string) {
    await this.getById(tenantId, id);
    const updated = await materialRepository.update(id, input);
    await this.audit(tenantId, actorId, 'study_material', id, 'update');
    return updated;
  }

  async delete(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await materialRepository.delete(id);
    await this.audit(tenantId, actorId, 'study_material', id, 'delete');
    return { message: 'Material deleted' };
  }

  async download(tenantId: string, id: string) {
    const m = await this.getById(tenantId, id);
    await materialRepository.incrementDownloads(id);
    return { fileUrl: m.fileUrl, fileName: m.fileName, externalUrl: m.externalUrl };
  }

  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string, action: string) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action } });
  }
}

export const materialService = new MaterialService();
