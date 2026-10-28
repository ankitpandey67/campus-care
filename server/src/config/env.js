import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-complaint',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_LIMIT: Number(process.env.UPLOAD_LIMIT || 5242880),
};
