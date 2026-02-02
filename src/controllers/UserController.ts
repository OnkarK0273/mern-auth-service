import type { Logger } from 'winston';

import type { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types';

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    // validator
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password, role, tenantId } = req.body;

    try {
      const users = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      });

      res.status(201).json({ id: users.id });
    } catch (error) {
      next(error);
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    // validator
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, role } = req.body;
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    this.logger.debug('Request for updating a user', req.body);

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      this.logger.info('User has been updated', { id: userId });

      res.json({ id: Number(userId) });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const allUser = await this.userService.get();
      this.logger.info('All users have been fetched');

      res.json(allUser);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: CreateUserRequest, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    try {
      const user = await this.userService.findById(Number(userId));
      if (!user) {
        next(createHttpError(400, 'User does not exist.'));
        return;
      }

      this.logger.info('User has been fetched', { id: user.id });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: CreateUserRequest, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    try {
      await this.userService.deleteById(Number(userId));
      this.logger.info('User has been deleted', {
        id: Number(userId),
      });
      res.json({ id: Number(userId) });
    } catch (error) {
      next(error);
    }
  }
}
