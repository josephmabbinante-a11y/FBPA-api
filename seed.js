// Script to seed MongoDB with example data
// Usage: node scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from './models/Customer.js';
import Carrier from './models/Carrier.js';
import Invoice from './models/Invoice.js';
import Exception from './models/Exception.js';
import Driver from './models/Driver.js';
import Vehicle from './models/Vehicle.js';
import Trip from './models/Trip.js';
import { customers, carriers, invoices, exceptions, drivers, vehicles, trips } from './seedData.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://FBPADB:FBPA2020@cluster0.fvycshx.mongodb.net/fbpa-db?appName=Cluster0';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Customer.deleteMany({});
  await Carrier.deleteMany({});
  await Invoice.deleteMany({});
  await Exception.deleteMany({});
  await Driver.deleteMany({});
  await Vehicle.deleteMany({});
  await Trip.deleteMany({});
  await Customer.insertMany(customers);
  await Carrier.insertMany(carriers);
  await Invoice.insertMany(invoices);
  await Exception.insertMany(exceptions);
  await Driver.insertMany(drivers);
  await Vehicle.insertMany(vehicles);
  await Trip.insertMany(trips);
  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
