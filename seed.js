// Script to seed MongoDB with example data
// Usage: node seed.js
// Usage: node scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from './models/Customer.js';
import Carrier from './models/Carrier.js';
import Invoice from './models/Invoice.js';
import Exception from './models/Exception.js';
import { customers, carriers, invoices, exceptions } from './seedData.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbpa';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Customer.deleteMany({});
  await Carrier.deleteMany({});
  await Invoice.deleteMany({});
  await Exception.deleteMany({});
  await Customer.insertMany(customers);
  await Carrier.insertMany(carriers);
  await Invoice.insertMany(invoices);
  await Exception.insertMany(exceptions);
  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
