import { Router } from 'express';
import { barberController } from '../controllers/barberController.js';

const router = Router();

// Barbeiros
router.get('/', barberController.list);
router.get('/:id', barberController.findById);
router.post('/', barberController.create);
router.put('/:id', barberController.update);
router.delete('/:id', barberController.remove);

// Horários
router.get('/:barberId/schedules', barberController.listSchedule);
router.post('/:barberId/schedules', barberController.upsertSchedule);
router.delete('/:barberId/schedules/:scheduleId', barberController.deleteSchedule);

export default router;
