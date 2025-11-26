import { appointmentService } from '../services/appointmentService.js';

export const appointmentController = {
  // 🔹 Lista todos os agendamentos
  list: async (req, res, next) => {
    try {
      let appointments;

      if (req.user.role === 'BARBER') {
        appointments = await appointmentService.listByBarber(req.user.id);
      } else if (req.user.role === 'ADMIN') {
        appointments = await appointmentService.listAll();
      } else {
        return res.status(403).json({ error: "Acesso negado." });
      }

      res.json(appointments);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        const error = new Error('ID do agendamento é obrigatório.');
        error.status = 400;
        throw error;
      }
      const appointment = await appointmentService.findById(Number(id));
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Cria um novo agendamento
  create: async (req, res, next) => {
    try {
      const {
        barberId,
        serviceId,
        date,
        time,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
      } = req.body;

      const appointment = await appointmentService.create({
        barberId: Number(barberId),
        serviceId: Number(serviceId),
        date,
        time,
        customerId: customerId ? Number(customerId) : undefined,
        customerName,
        customerPhone,
        customerEmail,
      });

      res.status(201).json({
        message: 'Agendamento criado com sucesso!',
        appointment,
      });
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Confirma um agendamento existente
  confirm: async (req, res, next) => {
    try {
      const appointment = await appointmentService.findById(req.params.id);
      const updated = await appointmentService.confirm(Number(req.params.id));
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // 🔹 Cancela um agendamento existente
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await appointmentService.cancel(Number(id));
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
