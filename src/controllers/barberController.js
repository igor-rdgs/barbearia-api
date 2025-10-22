import { barberService } from '../services/barberService.js';

export const barberController = {
  list: async (req, res, next) => {
    try {
      const barbers = await barberService.list();
      res.status(200).json(barbers);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const barber = await barberService.findById(id);
      res.status(200).json(barber);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const barber = await barberService.create({ name, email, password });
      res.status(201).json({
        message: 'Barbeiro criado com sucesso.',
        barber: barber
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      const updated = await barberService.update(id, { name, email, password });
      res.status(200).json({
        message: 'Barbeiro atualizado com sucesso.',
        barbeiro: updated
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      await barberService.remove(id);
      res.json({
        message: 'Barbeiro removido com sucesso.'
      });
    } catch (err) {
      next(err);
    }
  },

  listSchedule: async (req, res, next) => {
    try {
      const schedules = await barberService.listSchedule(req.params.barberId);
      res.json(schedules);
    } catch (err) {
      next(err);
    }
  },

  upsertSchedule: async (req, res, next) => {
    try {
      const { dayOfWeek, startTime, endTime } = req.body;
      const schedule = await barberService.upsertSchedule({
        barberId: req.params.barberId,
        dayOfWeek,
        startTime,
        endTime,
      });
      res.status(201).json({
        message: 'Horário criado ou atualizado com sucesso.',
        schedule
      });
    } catch (err) {
      next(err);
    }
  },

  deleteSchedule: async (req, res, next) => {
    try {
      await barberService.deleteSchedule(req.params.barberId, req.params.scheduleId);
      res.json({ message: 'Horário removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  },
};
