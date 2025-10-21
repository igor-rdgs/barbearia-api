import express from 'express';
import { listarHorarios, criarHorario, atualizarHorario, deletarHorario } from '../controllers/scheduleController.js';
const router = express.Router();

// Listar horários de um barbeiro
router.get('/:barberId', listarHorarios);

// Criar horário
router.post('/', criarHorario);

// Atualizar horário
router.put('/:id', atualizarHorario);

// Deletar horário
router.delete('/:id', deletarHorario);

export default router;
