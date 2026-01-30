import { TokenService } from '@/services/TokenService';
import { Roles } from '../constants';
import { UserService } from '../services/UserService';
import { LoginUserRequest, RegisterUserRequest } from '../types';
import { type Request, type Response, type NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { CredentialService } from '@/services/CredentialService';
import createHttpError from 'http-errors';

export class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validator
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await this.userService.create({ firstName, lastName, email, password, role: Roles.CUSTOMER });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // Very important
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const error = createHttpError(400, 'Email or password does not match.');
        next(error);
        return;
      }

      const passwordMatch = await this.credentialService.comparePassword(password, user.password);

      if (!passwordMatch) {
        const error = createHttpError(400, 'Email or password does not match.');
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // Very important
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}
