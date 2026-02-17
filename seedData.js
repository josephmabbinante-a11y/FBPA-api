// Example data for seeding the database
// Place this in scripts/seedData.js or similar


import { v4 as uuidv4 } from "uuid";

const customerId1 = uuidv4();
const customerId2 = uuidv4();
const carrierId1 = uuidv4();
const invoiceId1 = uuidv4();
const exceptionId1 = uuidv4();

export const customers = [
  {
    id: customerId1,
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '555-1234',
    company: 'Acme Corp',
    industry: 'Retail',
    taxId: '12-3456789',
    billingAddress: '123 Main St, City, State',
    nameLower: 'acme corp',
    emailLower: 'contact@acme.com',
    status: 'Active',
  },
  {
    id: customerId2,
    name: 'Beta LLC',
    email: 'info@beta.com',
    phone: '555-5678',
    company: 'Beta LLC',
    industry: 'Logistics',
    taxId: '98-7654321',
    billingAddress: '456 Market Ave, City, State',
    nameLower: 'beta llc',
    emailLower: 'info@beta.com',
    status: 'Active',
  },
];

export const carriers = [
  {
    id: carrierId1,
    name: 'Fast Freight',
    mcNumber: 'MC123456',
    dotNumber: 'DOT654321',
    email: 'dispatch@fastfreight.com',
    phone: '555-8765',
    paymentTerms: 'Net 30',
    insuranceExpiry: new Date('2026-12-31'),
    taxId: '22-3334444',
    status: 'Active',
    nameLower: 'fast freight',
    mcNumberNormalized: '123456',
  },
];

export const invoices = [
  {
    id: invoiceId1,
    type: 'AR',
    customerId: customerId1,
    carrierId: carrierId1,
    customerName: 'Acme Corp',
    carrierName: 'Fast Freight',
    carrier: 'Fast Freight',
    invoiceNumber: '1001',
    amount: 1200.00,
    accessorials: 50.00,
    fuelSurcharge: 30.00,
    contractRate: 1120.00,
    status: 'Pending',
    dueDate: new Date('2026-03-01'),
    issueDate: new Date('2026-02-01'),
    paymentTerms: 'Net 30',
  },
];

export const exceptions = [
  {
    id: exceptionId1,
    invoiceId: invoiceId1,
    invoiceNumber: '1001',
    customerId: customerId1,
    customer: 'Acme Corp',
    carrierId: carrierId1,
    carrier: 'Fast Freight',
    amount: 50.00,
    type: 'financial',
    reason: 'Accessorial charge mismatch',
    description: 'Accessorial charge exceeds contract rate',
    severity: 'Medium',
    status: 'Open',
  },
];
