import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth.route';
const app: Application = express();

// Middlewares
app.use(
  express.static('public', {
    dotfiles: 'allow', // This ensures folders like .well-known are accessible
  }),
);
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', env: Config.NODE_ENV });
});

// registration
app.use('/auth', authRouter);

// Global Error Handler
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message);
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    error: [
      {
        type: error.name,
        msg: error.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
