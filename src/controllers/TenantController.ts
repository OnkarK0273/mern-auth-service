import { CreateTenantRequest, TenantQueryParams } from '../types';
import { TenantService } from '../services/TenantService';
import { type Response, type NextFunction, type Request } from 'express';
import { Logger } from 'winston';
import { matchedData, validationResult } from 'express-validator';
export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    this.logger.debug('Request for creating a tenant', req.body);
    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info('Tenant has been created', { id: tenant.id });
      res.json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;
    this.logger.debug('Request for updating a tenant', req.body);

    try {
      const tenant = await this.tenantService.update(Number(tenantId), { name, address });
      this.logger.info('Tenant has been updated', { id: tenantId });
      res.json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    this.logger.debug('Request for get all tenant');
    try {
      const [tenants, totalCount] = await this.tenantService.get(validatedQuery as TenantQueryParams);
      this.logger.info('All tenant have been fetched');
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: totalCount,
        data: tenants,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    this.logger.debug('Request for get a tenant', tenantId);
    try {
      const tenant = await this.tenantService.getById(Number(tenantId));
      this.logger.info('One tenant have been fetched');
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    this.logger.debug('Request for delete a tenant', tenantId);
    try {
      await this.tenantService.deleteById(Number(tenantId));
      this.logger.info('One tenant have been deleted');
      res.json({ id: Number(tenantId) });
    } catch (error) {
      next(error);
    }
  }
}
