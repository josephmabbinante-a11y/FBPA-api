# FBPA API - Backend

This is the backend API for the Freight Bill Pay Automation (FBPA) system. It provides RESTful endpoints for managing carriers, customers, invoices, exceptions, and related operations.

## Features

- **Customer Management**: CRUD operations for customers with aging reports and CSV upload support
- **Carrier Management**: Manage carrier information and relationships
- **Invoice Processing**: Handle invoices with image uploads and verification
- **Exception Tracking**: Monitor and manage exceptions in the freight billing process
- **Dashboard & Reports**: Get analytics and generate reports
- **EDI Integration**: Connect to Electronic Data Interchange systems
- **Rate Calculation**: Calculate freight rates based on business logic
- **Messaging**: Send notifications and view activity logs

## Prerequisites

- Node.js >= 18
- MongoDB (optional, can run without database)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/fbpa
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
DEV_AUTH_ALLOW_ANY=false
SERVE_STATIC=false
```

## Running the Server

### Development
```bash
npm start
```

### Production
```bash
node index.js
```

The server will start on `http://localhost:4000` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Check server status and database connection

### Authentication
- `POST /auth/login` - Authenticate user and receive JWT token

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/aging` - Get customer aging report
- `POST /api/customers` - Create new customer
- `POST /api/customers/upload-csv` - Upload customers via CSV file

### Carriers
- `GET /api/carriers` - List all carriers
- `GET /api/carriers/:id` - Get carrier details
- `POST /api/carriers` - Create new carrier
- `PATCH /api/carriers/:id` - Update carrier information

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice

### Invoice Images
- `GET /api/invoice-images` - List invoice images
- `POST /api/invoice-images` - Upload invoice image
- `POST /api/invoice-images/verify` - Verify invoice image

### Exceptions
- `GET /api/exceptions` - List all exceptions
- `POST /api/exceptions` - Create new exception

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics

### Reports
- `GET /api/reports` - Generate reports

### Rate Logic
- `POST /api/rate-logic/calculate` - Calculate freight rates

### Messages
- `POST /api/messages/send` - Send message/notification
- `GET /api/messages/activity` - Get message activity log

### EDI
- `POST /api/edi/connect` - Connect to EDI system

### File Uploads
- `POST /api/uploads` - Upload files

## Testing

Run backend flow tests:
```bash
npm run test:backend-flow
```

## Database

The API uses MongoDB for data persistence. If `MONGODB_URI` is not configured, the server will run without database functionality.

## CORS Configuration

By default, the following origins are allowed:
- http://localhost:5173-5179

Additional origins can be configured via the `CORS_ORIGIN` environment variable (comma-separated).

## License

Private
