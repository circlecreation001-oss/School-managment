import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class MaterialRepository {
  async list(tenantId: string, params: { page: number; limit: number; search?: string; classId?: string; subjectId?: string; batchId?: string; category?: string }) {
    const where: Prisma.StudyMaterialWhereInput = { tenantId, deletedAt: null };
    if (params.classId) where.classId = params.classId;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.batchId) where.batchId = params.batchId;
    if (params.category) where.category = params.category;
    if (params.search) { where.OR = [{ title: { contains: params.search, mode: 'insensitive' } }, { description: { contains: params.search, mode: 'insensitive' } }]; }

    const [data, total] = await Promise.all([
      prisma.studyMaterial.findMany({ where, include: { class: { select: { name: true } }, subject: { select: { name: true } }, teacher: { select: { firstName: true, lastName: true } } }, skip: (params.page - 1) * params.limit, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.studyMaterial.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) { return prisma.studyMaterial.findUnique({ where: { id } }); }
  async create(data: Prisma.StudyMaterialUncheckedCreateInput) { return prisma.studyMaterial.create({ data }); }
  async update(id: string, data: Prisma.StudyMaterialUpdateInput) { return prisma.studyMaterial.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.studyMaterial.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }
  async incrementDownloads(id: string) { return prisma.studyMaterial.update({ where: { id }, data: { downloadCount: { increment: 1 } } }); }
}

export const materialRepository = new MaterialRepository();
