import prisma from '../prismaClient.js';

export const serviceService = {
  list: async () => {
    return prisma.service.findMany({ orderBy: { name: 'asc' } });
  },

  findById: async (id) => {
    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
    });
    if (!service) {
      const err = new Error('Serviço não encontrado.');
      err.status = 404;
      throw err;
    }
    return service;
  },

  create: async (data) => {
    const { name, description, duration, price } = data;

    if (!name || !price || !duration) {
      const err = new Error('Nome, duração e preço são obrigatórios.');
      err.status = 400;
      throw err;
    }

    const existing = await prisma.service.findUnique({
      where: { name },
    });

    if (existing) {
      const err = new Error('Já existe um serviço com este nome.');
      err.status = 409;
      throw err;
    }

    return prisma.service.create({
      data: {
        name,
        price: Number(price),
        duration: Number(duration),
        description: data.description || null,
      },
    });
  },

  update: async (id, data) => {
    const existing = await serviceService.findById(id);

    // Evita duplicidade de nome ao atualizar
    if (data.name && data.name !== existing.name) {
      const duplicated = await prisma.service.findUnique({
        where: { name: data.name },
      });
      if (duplicated) {
        const err = new Error('Nome de serviço já está em uso.');
        err.status = 409;
        throw err;
      }
    }

    return prisma.service.update({
      where: { id: Number(id) },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        price: data.price ? Number(data.price) : existing.price,
        duration: data.duration ? Number(data.duration) : existing.duration,
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
