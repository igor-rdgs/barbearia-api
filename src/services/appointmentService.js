import prisma from '../prismaClient.js';
import { AppointmentStatus } from '@prisma/client';
import { barberService } from './barberService.js';
import { customerService } from './customerService.js';
import { serviceService } from './serviceService.js';
import { addMinutes, isBefore, isAfter } from 'date-fns';

export const appointmentService = {
  listar: async () => {
    return prisma.appointment.findMany({
      include: { barber: true, customer: true, service: true },
      orderBy: { date: 'asc' },
    });
  },

  criar: async ({ barberId, customerId, serviceId, date, time }) => {
    // 1) Valida existência das entidades
    const barber = await barberService.buscarPorId(barberId);
    const customer = await customerService.buscarPorId(customerId);
    const service = await serviceService.buscarPorId(serviceId);

    const appointmentStart = new Date(`${date}T${time}:00Z`);
    const appointmentEnd = addMinutes(appointmentStart, service.duration);

    // 2) Busca todos os agendamentos do barbeiro no mesmo dia
    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
      include: { service: true },
    });

    // 3) Verifica conflitos de horário
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

    // 4) Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        customerId,
        serviceId,
        date: appointmentStart,
        time,
        status: AppointmentStatus.PENDING,
      },
      include: { barber: true, customer: true, service: true },
    });

    return appointment;
  },

  confirmar: async (id) => {
    return prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: { barber: true, customer: true, service: true },
    });
  },

  cancelar: async (id) => {
    return prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: { barber: true, customer: true, service: true },
    });
  },
};

