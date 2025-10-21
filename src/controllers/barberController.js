import { barberService } from '../services/barberService.js';

export const barberController = {
  list: async (req, res, next) => {
    try {
      const barbers = await barberService.list();
      res.json(barbers);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const barber = await barberService.findById(req.params.id);
      res.json(barber);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const newBarber = await barberService.create(req.body);
      res.status(201).json(newBarber);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedBarber = await barberService.update(req.params.id, req.body);
      res.json(updatedBarber);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      await barberService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
}