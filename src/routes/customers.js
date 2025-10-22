import express from 'express';
import { customerController } from '../controllers/customerController.js';
const router = express.Router();

router.get('/', customerController.list);
router.get('/:id', customerController.findById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.remove);

export default router;
