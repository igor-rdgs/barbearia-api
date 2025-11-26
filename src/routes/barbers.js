import { Router } from 'express';
import { barberController } from '../controllers/barberController.js';
import { authenticate, authorize } from '../middlewares/authenticate.js';

const router = Router();

// Rotas protegidas para gerenciamento de barbeiros
router.get('/', authenticate, authorize('ADMIN', 'BARBER'), barberController.list);
router.get('/:id', authenticate, authorize('ADMIN', 'BARBER'), barberController.findById);
router.post('/', authenticate, authorize('ADMIN'), barberController.create);
router.put('/:id', authenticate, authorize('ADMIN'), barberController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), barberController.remove);

// Obter compromissos do barbeiro autenticado
router.get('/me/appointments', authenticate, authorize('BARBER'), barberController.getMyAppointments);

// Horários
router.get('/:barberId/schedules', barberController.listSchedule);
router.post('/:barberId/schedules', authenticate, authorize('ADMIN'), barberController.upsertSchedule);
router.delete('/:barberId/schedules/:scheduleId', authenticate, authorize('ADMIN'), barberController.deleteSchedule);

export default router;
