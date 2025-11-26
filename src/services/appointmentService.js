import prisma from '../prismaClient.js';
import { AppointmentStatus } from '@prisma/client';
import { barberService } from './barberService.js';
import { customerService } from './customerService.js';
import { serviceService } from './serviceService.js';
import { addMinutes, isBefore, isAfter } from 'date-fns';
import { removePassword } from '../utils/removePassword.js';
import { formatDate } from '../utils/formatDate.js';
import { emailService } from './emailService.js';

export const appointmentService = {
  listByBarber: async (barberId) => {
    return prisma.appointment.findMany({
      where: { barberId: Number(barberId) },
      orderBy: { date: 'asc' },
      include: { barber: true, customer: true, service: true },
    });
  },

  listAll: async () => {
    const appointments = await prisma.appointment.findMany({
      include: { barber: true, customer: true, service: true },
      orderBy: { date: 'asc' },
    });

    return appointments.map(a => ({
      ...a,
      barber: removePassword(a.barber),
    }));
  },

  findById: async (id) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { barber: true, customer: true, service: true },
    });

    if (!appointment) {
      const err = new Error('Agendamento não encontrado.');
      err.status = 404;
      throw err;
    };

    return appointment;
  },

  create: async ({ barberId, serviceId, date, time, customerId, customerName, customerPhone, customerEmail }) => {
    // 1) Valida barbeiro e serviço
    await barberService.findById(barberId);
    const service = await serviceService.findById(serviceId);

    // 2) Garante cliente
    let customer;

    if (customerId) {
      // Se foi passado um ID, busca o cliente
      customer = await customerService.findById(customerId);
    } else if (customerPhone) {
      // Se não há ID, mas há telefone, tenta buscar o cliente existente
      customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });

      if (!customer) {
        // Cria novo cliente caso ainda não exista com este telefone
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
          },
        });
      } else if (customer.name !== customerName) {
        // Impede criar agendamento com telefone de outro cliente
        const err = new Error('Já existe um cliente cadastrado com este telefone.');
        err.status = 400;
        throw err;
      }
    } else {
      const err = new Error('É necessário informar o cliente ou um número de telefone válido.');
      err.status = 400;
      throw err;
    }

    // 3) Monta data/hora local
    const appointmentStart = new Date(`${date}T${time}:00`);
    const appointmentEnd = addMinutes(appointmentStart, service.duration);

    // 4) Busca agendamentos do barbeiro (ignorando cancelados)
    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { not: AppointmentStatus.CANCELLED },
        date: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
      include: { service: true },
    });

    // 5) Verifica conflito de horários (independente do cliente)
    for (const existing of sameDayAppointments) {
      const existingStart = existing.date;
      const existingEnd = addMinutes(existingStart, existing.service.duration);

      const overlaps =
        (isBefore(appointmentStart, existingEnd) && isAfter(appointmentEnd, existingStart)) ||
        (isBefore(existingStart, appointmentEnd) && isAfter(existingEnd, appointmentStart));

      if (overlaps) {
        const err = new Error('Horário indisponível: o barbeiro já possui outro agendamento neste horário.');
        err.status = 400;
        throw err;
      }
    }

    // 6) Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        customerId: customer.id,
        serviceId,
        date: appointmentStart,
        time,
        status: AppointmentStatus.PENDING,
      },
      include: { barber: true, customer: true, service: true },
    });

    // 7) Remove senha do barbeiro da resposta
    return appointment;
  },

  confirm: async (id) => {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: { barber: true, customer: true, service: true },
    });

    // Envia e-mail
    emailService.sendAppointmentConfirmed({
      customerName: appointment.customer.name,
      customerEmail: appointment.customer.email,
      date: appointment.date,
      serviceName: appointment.service.name,
    });

    return appointment;
  },

  cancel: async (id) => {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: { barber: true, customer: true, service: true },
    });

    // Envia e-mail
    emailService.sendAppointmentCancelled({
      customerName: appointment.customer.name,
      customerEmail: appointment.customer.email,
      date: appointment.date,
      serviceName: appointment.service.name,
    });

    emailService.notifyBarberCancelled({
      barberName: appointment.barber.name,
      customerName: appointment.customer.name,
      date: appointment.date,
      serviceName: appointment.service.name,
    });
    
    return appointment;
  },
};
