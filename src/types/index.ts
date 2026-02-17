import type { Request } from 'express';

export type UserData = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: number;
};

export type UpdateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId?: number;
};

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export interface AuthCookie {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenPayload {
  id: string;
}

export type TenantData = {
  name: string;
  address: string;
};

export interface CreateTenantRequest extends Request {
  body: TenantData;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface UpdateUserRequest extends Request {
  body: UpdateUserData;
}

export interface UserQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}

export interface TenantQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}
