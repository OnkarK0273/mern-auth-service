import { TokenService } from '../services/TokenService';
import { AuthController } from '../controllers/AuthController';
import { prisma } from '../lib/prisma';
import { UserService } from '../services/UserService';
import express, { type Request, type Response, type NextFunction } from 'express';
import createUserValidator from '../validators/create-user-validator';
import { CredentialService } from '../services/CredentialService';
import logger from '../config/logger';
import loginValidator from '../validators/login-validator';
import authenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';
import validateRefreshToken from '../middlewares/validateRefreshToken';

const router = express.Router();
const userService = new UserService(prisma);
const tokenService = new TokenService(prisma);
const credentialService = new CredentialService();
const authController = new AuthController(userService, tokenService, credentialService, logger);
router
  .route('/register')
  .post(createUserValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
  );

router
  .route('/login')
  .post(loginValidator, (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next));

router.route('/self').get(authenticate, (req: Request, res: Response) => authController.self(req as AuthRequest, res));

router
  .route('/refresh')
  .post(validateRefreshToken, (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next),
  );

export default router;
