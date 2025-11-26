import prisma from '../prismaClient.js';
import { addMinutes, format } from 'date-fns';
import bcrypt from 'bcrypt';

export const barberService = {
  list: async () => {
    const barbers = await prisma.user.findMany({
      where: { role: 'BARBER' },
      orderBy: { name: 'asc' },
      include: { schedules: true },
      omit: { password: true },
    });

    return barbers;
  },

  findById: async (id) => {
    const barber = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { schedules: true },
      omit: { password: true },
    });

    if (!barber || barber.role !== 'BARBER') {
      const err = new Error('Barbeiro não encontrado.');
      err.status = 404;
      throw err;
    }

    return barber;
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
      omit: { password: true },
    });

    return barber;
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
      omit: { password: true },
    });

    return updated;
  },

  remove: async (id) => {
    await barberService.findById(id);
    return prisma.user.delete({ where: { id: Number(id) } });
  },

  getAppointmentsByBarber: async (barberId) => {
    const records = await prisma.appointment.findMany({
      where: { barberId: Number(barberId) },
      include: {
        customer: true,
        service: true,
      },
      omit: { barber: { password: true } },
      orderBy: { date: 'asc' }
    });

    // Agrupando por data (YYYY-MM-DD)
    const grouped = {};

    records.forEach(a => {
      const day = format(a.date, 'yyyy-MM-dd');
      if (!grouped[day]) grouped[day] = [];

      grouped[day].push({
        time: format(a.date, 'HH:mm'),
        customer: a.customer.name,
        phone: a.customer.phone,
        service: a.service.name,
        duration: a.service.duration,
        status: a.status
      });
    });

    return grouped;
  },

  listSchedule: async (barberId) => {
    await barberService.findById(barberId);
    return prisma.barberSchedule.findMany({
      where: { barberId: Number(barberId) },
      orderBy: { dayOfWeek: 'asc' },
    });
  },

  getScheduleByDay: async (barberId, dayOfWeek) => {
    const schedule = await prisma.barberSchedule.findUnique({
      where: { barberId_dayOfWeek: { barberId: Number(barberId), dayOfWeek } },
    });
    if (!schedule) throw new Error('O barbeiro não trabalha nesse dia.');
    return schedule;
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

  getAvailableSlots: async (barberId, date) => {
    await barberService.findById(Number(barberId));

    const targetDate = new Date(`${date}T00:00:00`);

    // 1️⃣ Determina o dia da semana (0 = domingo, 6 = sábado)
    const dayOfWeek = targetDate.getUTCDay();

    // 2️⃣ Busca o horário de trabalho do barbeiro nesse dia
    const schedule = await prisma.barberSchedule.findUnique({
      where: {
        barberId_dayOfWeek: {
          barberId: Number(barberId),
          dayOfWeek,
        },
      },
    });

    if (!schedule) {
      return []; // barbeiro não trabalha nesse dia
    }

    // 3️⃣ Busca agendamentos existentes nesse dia
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: Number(barberId),
        date: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
      include: { service: true },
    });

    // 4️⃣ Gera slots disponíveis
    const availableSlots = [];
    let currentTime = new Date(`${date}T${schedule.startTime}`);
    const endTime = new Date(`${date}T${schedule.endTime}`);

    while (currentTime < endTime) {
      const formattedTime = format(currentTime, 'HH:mm');

      const conflict = appointments.some((appt) => {
        const apptStart = appt.date;
        const apptEnd = addMinutes(apptStart, appt.service.duration);
        return currentTime >= apptStart && currentTime < apptEnd;
      });

      if (!conflict) {
        availableSlots.push(formattedTime);
      }

      currentTime = addMinutes(currentTime, 30); // intervalo de 30 minutos
    }

    return availableSlots;
  },
};
