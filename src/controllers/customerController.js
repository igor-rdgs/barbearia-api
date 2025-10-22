import { customerService } from '../services/customerService.js';

export const customerController = {
  list: async (req, res, next) => {
    try {
      const customers = await customerService.list();
      res.json(customers);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const customer = await customerService.findById(Number(req.params.id));
      res.json(customer);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const newCustomer = await customerService.create(req.body);
      res.status(201).json({
        message: 'Cliente criado com sucesso.',
        customer: newCustomer,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedCustomer = await customerService.update(req.params.id, req.body)
      res.json({
        message: 'Cliente atualizado com sucesso.',
        customer: updatedCustomer,
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      await customerService.remove(req.params.id);
      res.status(200).json({ message: 'Cliente removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}


