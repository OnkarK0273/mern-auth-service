import { TokenService } from '@/services/TokenService';
import { AuthController } from '../controllers/AuthController';
import { prisma } from '../lib/prisma';
import { UserService } from '../services/UserService';
import express, { type Request, type Response, type NextFunction } from 'express';
import createUserValidator from '@/validators/create-user-validator';

const router = express.Router();
const userService = new UserService(prisma);
const tokenService = new TokenService(prisma);
const authController = new AuthController(userService, tokenService);
router
  .route('/register')
  .post(createUserValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
  );

export default router;
