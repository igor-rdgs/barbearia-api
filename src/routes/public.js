import express from 'express';
import { publicController } from '../controllers/publicController.js';

const router = express.Router();

router.get('/barbers', publicController.listBarbers);
router.get('/barbers/:id/next-available', publicController.getNextAvailableSlot);
router.get('/services', publicController.listServices);
router.get('/appointments/availability', publicController.getAvailability);
router.get('/appointments/:id', publicController.getAppointmentById);
router.post('/appointments', publicController.createAppointment);

export default router;
