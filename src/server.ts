import app from './app';
import { Config } from './config';
import logger from './config/logger';

const port = Config.PORT;

const server = app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${Config.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
