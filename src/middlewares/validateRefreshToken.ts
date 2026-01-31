import { expressjwt } from 'express-jwt';
import { Config } from '../config/index';
import { type Request } from 'express';
import type { IRefreshTokenPayload, AuthCookie } from '../types';
import { prisma } from '../lib/prisma';
import logger from '../config/logger';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  // extract the token
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
  //
  async isRevoked(request: Request, token) {
    try {
      const refreshToken = await prisma.refreshToken.findFirst({
        where: {
          id: Number((token?.payload as IRefreshTokenPayload).id),
          user: { id: Number(token?.payload.sub) },
        },
      });
      return refreshToken === null;
    } catch (err) {
      logger.error('Error while getting the refresh token', {
        id: (token?.payload as IRefreshTokenPayload).id,
      });
    }
    return true;
  },
});
