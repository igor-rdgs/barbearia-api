import prisma from '../prismaClient.js';

export const customerService = {
  list: async () => {
    return prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: { appointments: true },
    });
  },

  findById: async (id) => {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: { appointments: true },
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

    let customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (customer && (customer.name !== name || (email && customer.email !== email))) {
      throw new Error('Número de telefone já cadastrado para outro cliente.');
    }
    if (!customer) {
      customer = await prisma.customer.create({ data: { name, phone, email } });
    }
    return customer;
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
