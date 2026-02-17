import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';
import authRouter from './routes/auth.route';
import tenantRoute from './routes/tenant.route';
import userRoute from './routes/user.route';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
const app: Application = express();

// Middlewares
app.use(
  express.static('public', {
    dotfiles: 'allow', // This ensures folders like .well-known are accessible
  }),
);
// app.use(helmet());
app.use(
  cors({
    origin: Config.CLIENT_ORIGIN_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', env: Config.NODE_ENV });
});

// registration
app.use('/auth', authRouter);

// teant route
app.use('/tenant', tenantRoute);

// user route
app.use('/user', userRoute);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
