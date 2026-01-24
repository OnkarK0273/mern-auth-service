import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import logger from './config/logger';
import { HttpError } from 'http-errors';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http Logger (simplistic for now, usually morgan or winston-express)
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', env: config.NODE_ENV });
});

// Global Error Handler
app.use((error: HttpError, req: Request, res: Response) => {
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
