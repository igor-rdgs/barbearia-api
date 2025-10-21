import express from 'express';
import { listarAgendamentos, criarAgendamento, confirmarAgendamento, cancelarAgendamento } from '../controllers/appointmentController.js';
const router = express.Router();

router.get('/', listarAgendamentos);
router.post('/', criarAgendamento);
router.patch('/:id/confirmar', confirmarAgendamento);
router.patch('/:id/cancelar', cancelarAgendamento);

export default router;
