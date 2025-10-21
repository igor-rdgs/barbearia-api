import prisma from '../prismaClient.js';
import { barberService } from './barberService.js';

export const scheduleService = {
  listarPorBarbeiro: async (barberId) => {
    await barberService.buscarPorId(Number(barberId)); // valida se o barbeiro existe
    return prisma.barberSchedule.findMany({
      where: { barberId: Number(barberId) },
      orderBy: { dayOfWeek: 'asc' },
    });
  },

  criar: async ({ barberId, dayOfWeek, startTime, endTime }) => {
    await barberService.buscarPorId(Number(barberId));

    // verifica se já existe um schedule para o dia
    const existing = await prisma.barberSchedule.findUnique({
      where: { barberId_dayOfWeek: { barberId: Number(barberId), dayOfWeek } },
    });
    if (existing) throw new Error('Já existe um horário definido para este dia.');

    return prisma.barberSchedule.create({
      data: { barberId: Number(barberId), dayOfWeek, startTime, endTime },
    });
  },

  atualizar: async ({ id, startTime, endTime }) => {
    return prisma.barberSchedule.update({
      where: { id: Number(id) },
      data: { startTime, endTime },
    });
  },

  deletar: async (id) => {
    return prisma.barberSchedule.delete({
      where: { id: Number(id) },
    });
  },
};
