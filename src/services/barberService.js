import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';

export const barberService = {
  list: async () => {
    const barbers = await prisma.user.findMany({
      where: { role: 'BARBER' },
      orderBy: { name: 'asc' },
      include: { schedules: true },
    });

    // Remove o campo password antes de retornar
    return barbers.map(({ password, ...rest }) => rest);
  },

  findById: async (id) => {
    const barber = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { schedules: true },
    });

    if (!barber || barber.role !== 'BARBER') {
      const err = new Error('Barbeiro não encontrado.');
      err.status = 404;
      throw err;
    }

    // Remove o campo password
    const { password, ...safeBarber } = barber;
    return safeBarber;
  },

  create: async (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password) {
      const err = new Error('Nome, e-mail e senha são obrigatórios.');
      err.status = 400;
      throw err;
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      const err = new Error('Já existe um barbeiro com este e-mail.');
      err.status = 409;
      throw err;
    }

    // 🔒 Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const barber = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'BARBER',
      },
    });

    // Remove o campo password da resposta
    const { password: _, ...safeBarber } = barber;
    return safeBarber;
  },

  update: async (id, data) => {
    const existing = await barberService.findById(id);

    if (data.email && data.email !== existing.email) {
      const duplicated = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (duplicated) {
        const err = new Error('E-mail já está em uso.');
        err.status = 409;
        throw err;
      }
    }

    let newPassword = existing.password;
    if (data.password) {
      // 🔒 Re-hash se nova senha for informada
      newPassword = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name ?? existing.name,
        email: data.email ?? existing.email,
        password: newPassword,
      },
    });

    const { password, ...safeUpdated } = updated;
    return safeUpdated;
  },

  remove: async (id) => {
    await barberService.findById(id);
    return prisma.user.delete({ where: { id: Number(id) } });
  },

  listSchedule: async (barberId) => {
    await barberService.findById(barberId);
    return prisma.barberSchedule.findMany({
      where: { barberId: Number(barberId) },
      orderBy: { dayOfWeek: 'asc' },
    });
  },

  upsertSchedule: async ({ barberId, dayOfWeek, startTime, endTime }) => {
    await barberService.findById(Number(barberId));

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      const err = new Error('O dia da semana deve estar entre 0 (domingo) e 6 (sábado).');
      err.status = 400;
      throw err;
    };

    return prisma.barberSchedule.upsert({
      where: { barberId_dayOfWeek: { barberId: Number(barberId), dayOfWeek } },
      update: { startTime, endTime },
      create: { barberId: Number(barberId), dayOfWeek, startTime, endTime },
    });
  },

  deleteSchedule: async (barberId, id) => {
    await barberService.findById(Number(barberId));
    
    const schedule = await prisma.barberSchedule.findUnique({
      where: { id: Number(id) },
    });

    if (!schedule) {
      const err = new Error('Horário não encontrado.');
      err.status = 404;
      throw err;
    }
    
    return prisma.barberSchedule.delete({
      where: { id: Number(id) },
    });
  },
};
