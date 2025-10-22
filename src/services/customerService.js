import prisma from '../prismaClient.js';

export const customerService = {
  list: async () => {
    return prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id) => {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!customer) {
      const err = new Error('Cliente não encontrado.');
      err.status = 404;
      throw err;
    }
    return customer;
  },

  create: async (data) => {
    const { name, phone, email } = data;
    
    if (!name || !phone) {
      const err = new Error('Nome e telefone são obrigatórios.');
      err.status = 400;
      throw err;
    };

    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) {
      const err = new Error('Já existe um cliente com este e-mail.');
      err.status = 409; // conflito
      throw err;
    };

    return prisma.customer.create({
      data: { name, phone, email },
    });
  },

  update: async (id, data) => {
    const existing = await customerService.findById(id);

    // Evita duplicidade de e-mail ao atualizar
    if (data.email && data.email !== existing.email) {
      const duplicatedEmail = await prisma.customer.findUnique({
        where: { email: data.email },
      });
      if (duplicatedEmail) {
        const err = new Error('E-mail já está sendo usado por outro cliente.');
        err.status = 409;
        throw err;
      }
    };

    if (data.phone && data.phone !== existing.phone) {
      const duplicatedPhone = await prisma.customer.findUnique({
        where: { phone: data.phone },
      });
      if (duplicatedPhone) {
        const err = new Error('Este telefone já foi cadastrado.');
        err.status = 409;
        throw err;
      }
    }

    return prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: data.name ?? existing.name,
        email: data.email ?? existing.email,
        phone: data.phone ?? existing.phone,
      },
    });
  },

  remove: async (id) => {
    await customerService.findById(id);
    return prisma.customer.delete({
      where: { id: Number(id) },
    });
  },
};
