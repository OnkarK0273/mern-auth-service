import { UpdateUserRequest } from '@/types';
import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    errorMessage: 'First name is required!',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'Last name is required!',
    notEmpty: true,
    trim: true,
  },
  role: {
    errorMessage: 'Role is required!',
    notEmpty: true,
    trim: true,
  },
  email: {
    isEmail: {
      errorMessage: 'Invalid email!',
    },
    notEmpty: true,
    errorMessage: 'Email is required!',
    trim: true,
  },
  tenantId: {
    errorMessage: 'Tenant id is required!',
    trim: true,
    // 1. First, validate the business logic
    custom: {
      options: (value: string, { req }) => {
        const role = (req as UpdateUserRequest).body.role;
        if (role === 'admin') {
          return true; // Admins don't need a tenantId
        }
        return !!value; // Others must have one
      },
    },
    // 2. Then, transform the data for Prisma
    customSanitizer: {
      options: (value: string) => {
        // If it's empty, null, or whitespace, return null (Prisma Int?)
        if (!value || value === '') {
          return null;
        }
        // Convert the string "9" to the number 9
        return parseInt(value, 10);
      },
    },
  },
});
