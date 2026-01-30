import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    trim: true,
    errorMessage: 'Email is required!',
    notEmpty: true,
    isEmail: {
      errorMessage: 'Email should be a valid email',
    },
  },
  firstName: {
    errorMessage: 'First Name is required',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'Last Name is required',
    notEmpty: true,
    trim: true,
  },
});
