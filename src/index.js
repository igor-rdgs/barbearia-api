import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import serviceRoutes from './routes/services.js';
import barberRoutes from './routes/barbers.js';
import appointmentRoutes from './routes/appointments.js';
import customersRoutes from './routes/customers.js';
import publicRoutes from './routes/public.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main routes
app.use('/services', serviceRoutes);
app.use('/barbers', barberRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/customers', customersRoutes);
app.use('/public', publicRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Agendamento de Barbearia 🚀' });
});

// Middleware de erro
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));