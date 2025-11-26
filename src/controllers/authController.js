import { authService } from '../services/authService.js';

export const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register(name, email, password, role);
      return res.json(user);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
