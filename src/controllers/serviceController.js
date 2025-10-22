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
      const service = await serviceService.findById(req.params.id);
      res.json(service);
    } catch (err) {
      next(err);
    }
  },
  
  create: async (req, res, next) => {
    try {
      const newService = await serviceService.create(req.body);
      res.status(201).json({
        message: 'Serviço criado com sucesso.',
        service: newService,
      });
    } catch (err) {
      next(err);
    }
  },
  
  update: async (req, res, next) => {
    try {
      const updatedService = await serviceService.update(req.params.id, req.body);
      res.json({
        message: 'Serviço atualizado com sucesso.',
        service: updatedService,
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      await serviceService.remove(req.params.id);
      res.json({ message: 'Serviço removido com sucesso.'});
    } catch (err) {
      next(err);
    }
  },
}