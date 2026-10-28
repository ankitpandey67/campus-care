import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test-db';

test('connectDB resolves when a MongoDB memory fallback is available', async () => {
  await connectDB();
  assert.ok(mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2);
  await mongoose.disconnect();
});
