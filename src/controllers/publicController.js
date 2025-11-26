import { publicService } from '../services/publicService.js';
import { emailService } from '../services/emailService.js'
 
export const publicController = {
  listBarbers: async (req, res, next) => {
    try {
      const barbers = await publicService.listBarbers();
      res.json(barbers);
    } catch (err) {
      next(err);
    }
  },

  // Lista todos os serviços disponíveis
  listServices: async (req, res, next) => {
    try {
      const services = await publicService.listServices();
      res.json(services);
    } catch (err) {
      next(err);
    }
  },

  // Lista horários disponíveis de um barbeiro
  getAvailability: async (req, res, next) => {
    try {
      const { barberId, date, serviceId } = req.query;
      if (!barberId || !date || !serviceId) {
        return res.status(400).json({ error: 'barberId, date e serviceId são obrigatórios.' });
      }

      const result = await publicService.getAvailability(Number(barberId), date, Number(serviceId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getNextAvailableSlot: async (req, res, next) => {
    try {
      const { id: barberId } = req.params;
      const { serviceId, date } = req.query;

      if (!serviceId) throw { status: 400, message: 'serviceId é obrigatório' };

      const targetDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const availability = await publicService.getAvailability(Number(barberId), targetDate, Number(serviceId));

      if (!availability.availableTimes.length) {
        return res.status(404).json({ message: 'Nenhum horário disponível neste dia.' });
      }

      res.json({
        barber: availability.barber,
        service: availability.service,
        date: availability.date,
        nextAvailable: availability.availableTimes[0],
      });
    } catch (err) {
      next(err);
    }
  },

  getAppointmentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        const error = new Error('ID do agendamento é obrigatório.');
        error.status = 400;
        throw error;
      }

      const appointment = await publicService.getAppointmentById(id);
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  },

  // Cria um agendamento público (sem autenticação)
  createAppointment: async (req, res, next) => {
    try {
      const { barberId, serviceId, date, time, customerName, customerPhone, customerEmail } = req.body;
      const appointment = await publicService.createAppointment({
        barberId,
        serviceId,
        date,
        time,
        customerName,
        customerPhone,
        customerEmail,
      });
      res.status(201).json({ message: 'Agendamento criado com sucesso!', appointment });
    } catch (err) {
      next(err);
    }
  },
};
