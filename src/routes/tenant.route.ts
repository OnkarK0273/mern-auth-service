import { TenantService } from '../services/TenantService';
import { TenantController } from '../controllers/TenantController';
import express, { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import tenantValidator from '../validators/tenant-validator';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';

const router = express.Router();

const tenantService = new TenantService(prisma);
const tenantController = new TenantController(tenantService, logger);

router
  .route('/')
  .post(authenticate, canAccess([Roles.ADMIN]), tenantValidator, (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
  );

router
  .route('/:id')
  .patch(authenticate, canAccess([Roles.ADMIN]), tenantValidator, (req: Request, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
  );

router
  .route('/')
  .get(authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next),
  );

router
  .route('/:id')
  .get(authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
    tenantController.getOne(req, res, next),
  );

router
  .route('/:id')
  .delete(authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
    tenantController.destroy(req, res, next),
  );

export default router;
