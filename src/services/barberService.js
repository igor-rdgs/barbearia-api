import prisma from '../prismaClient.js';

export const barberService = {
  list: async () => {
    return prisma.user.findMany({
      where: { role: 'BARBER' },
      orderBy: { name: 'asc' },
      include: {
        schedules: true,
      },
    });
  },

  findById: async (id) => {
    const barber = await prisma.user.findUnique({ 
      where: { id: Number(id) },
      include: {
        schedules: true,
      },
    });

    if (!barber || barber.role !== 'BARBER') {
      throw new Error('Barbeiro não encontrado.');
    }
      
    return barber;
  },
  
  create: async (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password) {
      throw new Error('Nome, e-mail e senha são obrigatórios.');
    }

    return prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'BARBER'
      },
    });
  },

  update: async (id, data) => {
    const barber = barberService.findById(id);
    if (!barber) throw new Error('Barbeiro não encontrado.');

    return prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  },

  remove: async (id) => {
    await barberService.findById(id);
    return prisma.user.delete({
      where: {id: Number(id)},
    })
  },
};
