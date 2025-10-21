import prisma from '../prismaClient.js';

export const serviceService = {
  list: async () => {
    return prisma.service.findMany({ orderBy: { name: 'asc' } });
  },

  findById: async (id) => {
    const service = await prisma.service.findUnique({ 
      where: { id: Number(id) } 
    });
    if (!service) throw new Error('Serviço não encontrado.');
    return service;
  },

  create: async (data) => {
    const { name, description, duration, price } = data;
    if (!name || !duration || !price) {
      throw new Error('Nome, duração e preço são obrigatórios.');
    }

    return prisma.service.create({
      data: {
        name,
        description,
        duration: Number(duration),
        price: Number(price)
      },
    });
  },

  update: async (id, data) => {
    await serviceService.findById(id)

    return prisma.service.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description,
        duration: Number(data.duration),
        price: Number(data.price),
      },
    });
  },

  remove: async (id) => {
    await serviceService.findById(id);
    return prisma.service.delete({
      where: { id: Number(id) },
    });
  },
};
