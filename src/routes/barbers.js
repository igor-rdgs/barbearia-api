import express from 'express';
import { listarBarbeiros, buscarBarbeiroPorId } from '../controllers/barberController.js';
const router = express.Router();

router.get('/', listarBarbeiros);
router.get('/:id', buscarBarbeiroPorId);

export default router;
