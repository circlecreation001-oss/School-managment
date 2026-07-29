import { Request, Response, NextFunction } from 'express';
import { importService, autoDetectMappings, validateRows } from './import.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export class ImportController {
  /**
   * POST /imports/detect - Upload data array, auto-detect column mappings
   */
  async detectMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const { headers } = req.body;
      if (!headers || !Array.isArray(headers)) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'headers array is required' } });
        return;
      }
      const mappings = autoDetectMappings(headers);
      sendSuccess(res, { mappings, unmapped: headers.filter((h: string) => !mappings[h]) }, 'Column mappings detected');
    } catch (e) { next(e); }
  }

  /**
   * POST /imports/validate - Validate rows before importing
   */
  async validateData(req: Request, res: Response, next: NextFunction) {
    try {
      const { entity, data, mappings } = req.body;
      if (!entity || !data || !Array.isArray(data)) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'entity and data array are required' } });
        return;
      }
      const result = validateRows(entity, data, mappings || {});
      sendSuccess(res, result, `Validated ${result.totalRows} rows`);
    } catch (e) { next(e); }
  }

  /**
   * POST /imports/process - Execute the import
   */
  async processImport(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const branchId = req.user!.branchId || '';
      const { entity, data, mappings, duplicateAction, autoCreate } = req.body;

      if (!entity || !data || !Array.isArray(data)) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'entity and data array are required' } });
        return;
      }

      // Apply mappings to data
      const appliedMappings = mappings || autoDetectMappings(Object.keys(data[0] || {}));
      const mappedData = data.map((row: Record<string, any>) => {
        const mapped: Record<string, any> = {};
        for (const [col, value] of Object.entries(row)) {
          const targetField = appliedMappings[col] || col;
          mapped[targetField] = value;
        }
        return mapped;
      });

      const result = await importService.processImport(
        tenantId, branchId,
        { entity, duplicateAction: duplicateAction || 'skip', autoCreate: autoCreate !== false },
        mappedData, req.user!.id,
      );

      sendCreated(res, result, `Import complete: ${result.imported} imported, ${result.failed} failed`);
    } catch (e) { next(e); }
  }

  /**
   * GET /imports/templates/:entity - Download import template info
   */
  async getTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { entity } = req.params;
      const template = importService.getTemplate(entity!);
      sendSuccess(res, template, 'Template retrieved');
    } catch (e) { next(e); }
  }

  /**
   * GET /imports/history - Get import history
   */
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await importService.getHistory(req.user!.tenantId);
      sendSuccess(res, history, `${history.length} imports found`);
    } catch (e) { next(e); }
  }
}

export const importController = new ImportController();
