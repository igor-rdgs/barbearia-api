import prisma from '../prismaClient.js';

export const barberService = {
  listar: async () => {
    return prisma.user.findMany({
      where: { role: 'BARBER' },
      orderBy: { name: 'asc' },
    });
  },

  buscarPorId: async (id) => {
    const barber = await prisma.user.findUnique({ where: { id } });
    if (!barber) throw new Error('Barbeiro não encontrado.');
    return barber;
  },
};
