const express = require('express');
const authRouter = require('./auth.js');

const app = express();

app.use(express.json());

// Use the auth router instead of inline login endpoint
app.use('/auth', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});