import express from 'express';
import { getAvailability, createPublicAppointment } from '../controllers/publicController.js';

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/appointments', createPublicAppointment);

export default router;
