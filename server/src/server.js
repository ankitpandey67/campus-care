import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedDemoData } from './utils/seed.js';

const startServer = async () => {
  await connectDB();
  await seedDemoData();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer();
