import express from 'express';
import { serviceController } from '../controllers/serviceController.js';
const router = express.Router();

router.get('/', serviceController.list);
router.get('/:id', serviceController.findById);
router.post('/', serviceController.create);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.remove);

export default router;
