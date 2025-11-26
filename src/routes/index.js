import express from 'express';

// Importa todos os módulos de rotas
import barberRoutes from './barbers.js';
import serviceRoutes from './services.js';
import appointmentRoutes from './appointments.js';
import customerRoutes from './customers.js';
import publicRoutes from './public.js';

const router = express.Router();

// 🔹 Rotas públicas (consulta de barbeiros, horários disponíveis, etc.)
router.use('/public', publicRoutes);

// 🔹 Módulos principais do painel/admin
router.use('/barbers', barberRoutes);
router.use('/services', serviceRoutes);
router.use('/customers', customerRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
