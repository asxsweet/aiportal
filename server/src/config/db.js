import mongoose from 'mongoose';
import { config } from '../config.js';

/**
 * Connect to MongoDB using MONGO_URI (local: mongodb://127.0.0.1:27017/dbname, or Atlas).
 */
export async function connectDb() {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI is not set. Copy server/.env.example to server/.env and set MONGO_URI.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
