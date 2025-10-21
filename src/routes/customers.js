import express from 'express';
import { listarClientes, buscarClientePorId, criarCliente } from '../controllers/customerController.js';
const router = express.Router();

router.get('/', listarClientes);
router.get('/:id', buscarClientePorId);
router.post('/', criarCliente);

export default router;
