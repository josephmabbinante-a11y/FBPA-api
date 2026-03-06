import express from 'express';
import { registerUserAndOrganization } from '../controllers/registrationController.js';

const router = express.Router();

// Registration endpoint
router.post('/register', registerUserAndOrganization);

export default router;
// ...existing code...
