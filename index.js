// Importing necessary modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routers/auth'); // Adjust the path as necessary

// Create an instance of Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mydatabase', { // Update to your MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'UP' });
});

// Integrating Auth Router
app.use('/auth', authRouter);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
