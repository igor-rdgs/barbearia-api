import prisma from '../prismaClient.js';
import { AppointmentStatus } from '@prisma/client';
import { addMinutes, isBefore, isAfter, isSameDay } from 'date-fns';

export const publicService = {
  async getAvailability({ barberId, date, serviceId }) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay(); // 0 = domingo, 6 = sábado
    const now = new Date();

    // 1) Busca o horário de trabalho do barbeiro
    const schedule = await prisma.barberSchedule.findUnique({
      where: {
        barberId_dayOfWeek: {
          barberId: Number(barberId),
          dayOfWeek,
        },
      },
    });

    if (!schedule) {
      throw new Error('O barbeiro não possui horário definido para esse dia.');
    }

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });

    if (!service) {
      throw new Error('Serviço não encontrado.');
    }

    const startTime = schedule.startTime; // ex: "09:00"
    const endTime = schedule.endTime;     // ex: "18:00"
    const slotDuration = service.duration; // minutos

    const slots = [];
    const start = new Date(`${date}T${startTime}:00Z`);
    const end = new Date(`${date}T${endTime}:00Z`);

    let current = start;

    while (isBefore(addMinutes(current, slotDuration), addMinutes(end, 1))) {
      slots.push(current.toISOString());
      current = addMinutes(current, slotDuration);
    }

    // 2) Busca os agendamentos do barbeiro nesse dia
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: Number(barberId),
        date: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
      include: { service: true },
    });

    // 3) Remove horários que se sobrepõem
    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(slot);
      const slotEnd = addMinutes(slotStart, service.duration);

      // ❌ ignora horários que já passaram no mesmo dia
      if (isSameDay(slotStart, now) && isBefore(slotStart, now)) {
        return false;
      }

      for (const a of appointments) {
        const aStart = new Date(a.date);
        const aEnd = addMinutes(aStart, a.service.duration);

        const overlap =
          (isBefore(slotStart, aEnd) && isAfter(slotEnd, aStart)) ||
          (isBefore(aStart, slotEnd) && isAfter(aEnd, slotStart));

        if (overlap) return false;
      }

      return true;
    });

    return availableSlots.map(time =>
      new Date(time).toISOString().slice(11, 16) // retorna "HH:mm"
    );
  },

  async createAppointment({ barberId, serviceId, date, time, customerName, customerPhone }) {
    const dateISO = date; // formato "YYYY-MM-DD"
    const timeStr = time; // formato "HH:mm"
    const dateTime = new Date(`${dateISO}T${timeStr}:00Z`);

    // 1) Busca o serviço e a duração
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });
    if (!service) {
      throw new Error('Serviço não encontrado.');
    }

    const appointmentStart = dateTime;
    const appointmentEnd = addMinutes(dateTime, service.duration);

    // 2) Verifica se há conflito com outros agendamentos do barbeiro
    // const overlapping = await prisma.appointment.findFirst({
    //   where: {
    //     barberId: Number(barberId),
    //     date: {
    //       gte: new Date(dateISO + 'T00:00:00Z'),
    //       lt: new Date(dateISO + 'T23:59:59Z'),
    //     },
    //     OR: [
    //       {
    //         // Novo início cai dentro de outro agendamento
    //         date: { lte: appointmentStart },
    //         time: { not: null },
    //       },
    //     ],
    //   },
    // });

    // busca todos os appointments do dia para comparar intervalos
    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        barberId: Number(barberId),
        date: {
          gte: new Date(dateISO + 'T00:00:00Z'),
          lt: new Date(dateISO + 'T23:59:59Z'),
        },
      },
      include: {
        service: true,
      },
    });

    for (const existing of sameDayAppointments) {
      const existingStart = existing.date;
      const existingEnd = addMinutes(existingStart, existing.service.duration);

      const overlaps =
        (isBefore(appointmentStart, existingEnd) && isAfter(appointmentEnd, existingStart)) ||
        (isBefore(existingStart, appointmentEnd) && isAfter(existingEnd, appointmentStart));

      if (overlaps) {
        throw new Error('Horário indisponível: sobreposição com outro agendamento.');
      }
    }

    // 3) Encontra ou cria cliente
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
        },
      });
    }

    // 4) Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        barberId: Number(barberId),
        serviceId: Number(serviceId),
        customerId: customer.id,
        date: appointmentStart,
        time: timeStr,
        status: AppointmentStatus.PENDING,
      },
      include: {
        barber: true,
        service: true,
        customer: true,
      },
    });

    return {
      mensagem: 'Agendamento criado com sucesso!',
      appointment,
    };
  },
};
