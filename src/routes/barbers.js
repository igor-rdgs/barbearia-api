import express from 'express';
import { barberController } from '../controllers/barberController.js';


const router = express.Router();

router.get('/', barberController.list);
router.get('/:id', barberController.findById);
router.post('/', barberController.create);
router.put('/:id', barberController.update);
router.delete('/:id', barberController.remove);

router.get('/:id/schedule', barberController.listSchedule);
router.put('/:id/schedule', barberController.updateSchedule);
export default router;
