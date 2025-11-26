import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'changeme';

export const authService = {
  register: async (name, email, password, role = 'BARBER') => {
    const userExists = await prisma.user.findUnique({ where: { email }});
    if (userExists) throw new Error('Email já cadastrado.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    return user;
  },

  login: async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user) throw new Error('Email inválido.');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Credenciais inválidas.');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: '8h' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role }};
  }
};
