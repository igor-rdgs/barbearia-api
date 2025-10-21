import prisma from '../prismaClient.js';

export const customerService = {
  listar: async () => {
    return prisma.customer.findMany({ orderBy: { name: 'asc' } });
  },

  buscarPorId: async (id) => {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error('Cliente não encontrado.');
    return customer;
  },
};
