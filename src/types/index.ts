import type { Request } from 'express';

export type UserData = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

export interface RegisterUserRequest extends Request {
  body: UserData;
}
