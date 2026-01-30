import jwt, { type JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config/index';
import { UserData } from '@/types';
import { PrismaClient } from 'generated/prisma/client';
export class TokenService {
  constructor(private prisma: PrismaClient) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem'));
    } catch (err) {
      const error = createHttpError(500, 'Error while reading private key');
      throw error;
    }

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
    });

    return refreshToken;
  }

  async persistRefreshToken(user: UserData) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y
    const newRefreshToken = await this.prisma.refreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
        userId: user.id!,
      },
    });

    return newRefreshToken;
  }
}
