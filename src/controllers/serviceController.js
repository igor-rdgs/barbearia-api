import { serviceService } from '../services/serviceService.js';

export const serviceController = {
  list: async (req, res, next) => {
    try {
      const services = await serviceService.list();
      res.json(services);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const service = await serviceService.findById(id);
      res.json(service);
    } catch (err) {
      next(err);
    }
  },
  
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const newService = await serviceService.create(data);
      res.status(201).json(newService);
    } catch (err) {
      next(err);
    }
  },
  
  update: async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const updatedService = await serviceService.update(id, data);
      res.json(updatedService);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const id = req.params.id;
      await serviceService.remove(id);
      res.status(204).json({ message: 'Serviço removido'});
    } catch (err) {
      next(err);
    }
  },
}