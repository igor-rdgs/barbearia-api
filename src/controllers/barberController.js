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
      res.status(201).json(barber);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      const updated = await barberService.update(id, { name, email, password });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      await barberService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  updateSchedule: async (req, res, next) => {
    try {
      const { barberId } = req.params;
      const { dayOfWeek, startTime, endTime } = req.body;

      if (dayOfWeek === undefined || !startTime || !endTime) {
        const error = new Error('Os campos dayOfWeek, startTime e endTime são obrigatórios.');
        error.status = 400;
        throw error;
      }

      const schedule = await barberService.updateSchedule(
        barberId,
        Number(dayOfWeek),
        startTime,
        endTime
      );

      res.status(200).json(schedule);
    } catch (err) {
      next(err);
    }
  },

  listSchedule: async (req, res, next) => {
    try {
      const { barberId } = req.params;
      const schedules = await barberService.listSchedule(barberId);
      res.status(200).json(schedules);
    } catch (err) {
      next(err);
    }
  },
};
