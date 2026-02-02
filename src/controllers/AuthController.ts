import { TokenService } from '../services/TokenService';
import { Roles } from '../constants';
import { UserService } from '../services/UserService';
import { AuthRequest, RegisterUserRequest } from '../types';
import { type Response, type NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { CredentialService } from '../services/CredentialService';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

export class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private credentialService: CredentialService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validator
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('New request to register a user', {
      firstName,
      lastName,
      email,
      password: '******',
    });

    try {
      const user = await this.userService.create({ firstName, lastName, email, password, role: Roles.CUSTOMER });

      this.logger.info('User has been registered', { id: user });

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
    // validator
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body;
    this.logger.debug('New request to login a user', {
      email,
      password: '******',
    });

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
      this.logger.info('User has been logged in', { id: user.id });
      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    // token req.auth.id
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      this.logger.info('accessToken generated');

      const user = await this.userService.findById(Number(req.auth.sub));
      if (!user) {
        const error = createHttpError(400, 'User with the token could not find');
        next(error);
        return;
      }

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      this.logger.info('persisting refreshtoken');

      // Delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info('deleting old refreshtoken');

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

      this.logger.info('refresh and access token is rotated successfully', {
        id: user.id,
      });
      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info('Refresh token has been deleted', {
        id: req.auth.id,
      });
      this.logger.info('User has been logged out', { id: req.auth.sub });

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
