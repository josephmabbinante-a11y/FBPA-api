import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connection successful');
    process.exit(0);
  })
  .catch(e => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
