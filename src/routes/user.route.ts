import express, { type NextFunction, type Response } from 'express';
import { UserController } from '../controllers/UserController';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants/index';
import createUserValidator from '../validators/create-user-validator';
import { prisma } from '../lib/prisma';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import updateUserValidator from '../validators/update-user-validator';

const router = express.Router();

const userService = new UserService(prisma);
const userController = new UserController(userService, logger);

router
  .route('/')
  .post(
    authenticate,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) => userController.create(req, res, next),
  );

router
  .route('/:id')
  .patch(
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) => userController.update(req, res, next),
  );

router
  .route('/')
  .get(authenticate, canAccess([Roles.ADMIN]), (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
  );

router
  .route('/:id')
  .get(authenticate, canAccess([Roles.ADMIN]), (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.getOne(req, res, next),
  );

router
  .route('/:id')
  .delete(authenticate, canAccess([Roles.ADMIN]), (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.destroy(req, res, next),
  );

export default router;
