import jwt, { type JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config/index';
import { PrismaClient } from 'generated/prisma/client';
export class TokenService {
  constructor(private prisma: PrismaClient) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;

    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, 'SECRET_KEY is not set');
      throw error;
    }

    try {
      privateKey = Config.PRIVATE_KEY;
    } catch (err) {
      const error = createHttpError(500, 'Error while reading private key');
      throw error;
    }

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1d',
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

  async persistRefreshToken(userId: number) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y
    const newRefreshToken = await this.prisma.refreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
        userId: userId,
      },
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.prisma.refreshToken.delete({
      where: {
        id: tokenId,
      },
    });
  }
}
