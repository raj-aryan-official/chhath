import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { env } from './env.js';

let memoryServer = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);

  let uri = env.mongoUri;

  if (!uri) {
    if (env.isProduction) {
      throw new Error('MONGO_URI is required when NODE_ENV=production');
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(process.cwd(), '.mongo-data');
    fs.mkdirSync(dbPath, { recursive: true });
    memoryServer = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger' },
    });
    uri = memoryServer.getUri('kharna');
    console.log('[db] MONGO_URI not set — using local mongodb-memory-server (.mongo-data)');
  }

  await mongoose.connect(uri);
  console.log(`[db] Connected to database "${mongoose.connection.name}"`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
