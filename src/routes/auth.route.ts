import { TokenService } from '@/services/TokenService';
import { AuthController } from '../controllers/AuthController';
import { prisma } from '../lib/prisma';
import { UserService } from '../services/UserService';
import express, { type Request, type Response, type NextFunction } from 'express';
import createUserValidator from '@/validators/create-user-validator';
import { CredentialService } from '@/services/CredentialService';

const router = express.Router();
const userService = new UserService(prisma);
const tokenService = new TokenService(prisma);
const credentialService = new CredentialService();
const authController = new AuthController(userService, tokenService, credentialService);
router
  .route('/register')
  .post(createUserValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
  );

router.route('/login').post((req: Request, res: Response, next: NextFunction) => authController.login(req, res, next));

export default router;
