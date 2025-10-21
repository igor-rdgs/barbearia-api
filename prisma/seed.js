import prisma from '../src/prismaClient.js';

async function main() {
  console.log('Iniciando seed completo...');

  // 1️⃣ Criar barbeiros
  const barber1 = await prisma.user.create({
    data: { name: 'João', email: 'joao@barbearia.com', password: '123456', role: 'BARBER' }
  });

  const barber2 = await prisma.user.create({
    data: { name: 'Carlos', email: 'carlos@barbearia.com', password: '123456', role: 'BARBER' }
  });

  // 2️⃣ Criar clientes
  const customer1 = await prisma.customer.create({
    data: { name: 'Ana', phone: '11999990001', email: 'ana@email.com' }
  });

  const customer2 = await prisma.customer.create({
    data: { name: 'Pedro', phone: '11999990002', email: 'pedro@email.com' }
  });

  // 3️⃣ Criar serviços
  const service1 = await prisma.service.create({
    data: { name: 'Corte simples', duration: 30, price: 30.0, description: 'Corte básico de cabelo' }
  });

  const service2 = await prisma.service.create({
    data: { name: 'Barba', duration: 20, price: 20.0, description: 'Barba completa' }
  });

  const service3 = await prisma.service.create({
    data: { name: 'Corte + Barba', duration: 50, price: 45.0, description: 'Combo corte de cabelo + barba' }
  });

  // 4️⃣ Criar horários dos barbeiros (schedules)
  const schedules = [];
  for (let day = 1; day <= 5; day++) { // segunda a sexta
    schedules.push(
      prisma.barberSchedule.create({ data: { barberId: barber1.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00' } }),
      prisma.barberSchedule.create({ data: { barberId: barber2.id, dayOfWeek: day, startTime: '10:00', endTime: '18:00' } })
    );
  }
  await Promise.all(schedules);

  // 5️⃣ Criar alguns agendamentos
  await prisma.appointment.create({
    data: {
      barberId: barber1.id,
      customerId: customer1.id,
      serviceId: service1.id,
      date: new Date('2025-10-20T09:00:00.000Z'),
      time: '09:00',
      status: 'CONFIRMED'
    }
  });

  await prisma.appointment.create({
    data: {
      barberId: barber2.id,
      customerId: customer2.id,
      serviceId: service3.id,
      date: new Date('2025-10-21T10:00:00.000Z'),
      time: '10:00',
      status: 'PENDING'
    }
  });

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
