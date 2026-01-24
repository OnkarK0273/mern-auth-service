import { config } from 'dotenv';
import path from 'node:path';

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`),
});

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

// 2. Explicitly type the Exported Config
export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL: `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`,
};
