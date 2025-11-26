import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';
import { loadAppointment } from '../middlewares/LoadAppointments.js';
import { authorizeBarberOwnAppointments } from '../middlewares/authorizeBarberOwnAppointments.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'BARBER'), appointmentController.list);
router.get('/:id', authenticate, authorize('ADMIN', 'BARBER'), appointmentController.findById);
router.post('/', authenticate, authorize('ADMIN', 'BARBER'), appointmentController.create);
router.put(
  '/:id/confirm',
  authenticate,
  authorize('ADMIN', 'BARBER'),
  loadAppointment,
  authorizeBarberOwnAppointments,
  appointmentController.confirm
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'BARBER'),
  loadAppointment,
  authorizeBarberOwnAppointments,
  appointmentController.cancel
);

export default router;
