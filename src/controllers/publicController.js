import { publicService } from '../services/publicService.js';

export async function getAvailability(req, res, next) {
  try {
      const { barberId, date, serviceId } = req.query;

      if (!barberId || !date || !serviceId) {
        return res.status(400).json({ erro: 'barberId, date e serviceId são obrigatórios.' });
      }

      const horarios = await publicService.getAvailability({ barberId, date, serviceId });

      res.json({
        data: date,
        horariosDisponiveis: horarios,
      });
    } catch (error) {
      next(error);
    }
}

export async function createPublicAppointment(req, res, next) {
  try {
    const { barberId, serviceId, date, time, customerName, customerPhone } = req.body;

    if (!barberId || !serviceId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios: barberId, serviceId, date, time, customerName, customerPhone.' });
    }

    const appointment = await publicService.createAppointment({
      barberId,
      serviceId,
      date,
      time,
      customerName,
      customerPhone,
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

