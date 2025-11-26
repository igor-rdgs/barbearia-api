import prisma from '../prismaClient.js';
import { addMinutes } from 'date-fns';
import { barberService } from './barberService.js';
import { customerService } from './customerService.js';
import { serviceService } from './serviceService.js';
import { timeUtils } from '../utils/timeUtils.js';
import { emailService } from './emailService.js';

export const publicService = {
  listBarbers: async () => {
    return barberService.list();
  },

  listServices: async () => {
    return prisma.service.findMany({ orderBy: { name: 'asc' } });
  },

  // 🔹 Retorna horários disponíveis para um barbeiro e serviço em uma data
  getAvailability: async (barberId, date, serviceId) => {
    const barber = await barberService.findById(barberId);
    const service = await serviceService.findById(serviceId);
    const dayOfWeek = new Date(date).getDay();
    const schedule = await barberService.getScheduleByDay(barberId, dayOfWeek);

    const start = timeUtils.createDateTime(date, schedule.startTime);
    const end = timeUtils.createDateTime(date, schedule.endTime);

    const slots = [];
    let current = start;
    while (current <= end) {
      slots.push(current);
      current = addMinutes(current, service.duration);
    }

    const appointments = await prisma.appointment.findMany({
      where: { barberId: Number(barberId), date: { gte: start, lt: addMinutes(end, 1) } },
      include: { service: true },
    });

    // Filtra horários já ocupados e, se a data solicitada for hoje, remove horários anteriores ao momento atual
    const now = new Date();
    const requestedDate = new Date(date);
    const requestedDayStart = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate());
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Se a data requisitada for anterior a hoje, não há horários disponíveis
    if (requestedDayStart < todayStart) {
      return {
        barber: barber.name,
        service: service.name,
        date,
        availableTimes: []
      };
    }

    const availableTimes = slots
      .filter(slot => {
        // Não deve sobrepor com agendamentos existentes
        const free = !appointments.some(a =>
          timeUtils.hasOverlap(slot, addMinutes(slot, service.duration), a.date, addMinutes(a.date, a.service.duration))
        );

        if (!free) return false;

        // Se a data for hoje, remova horários anteriores ao momento atual
        if (requestedDayStart.getTime() === todayStart.getTime()) {
          return slot.getTime() >= now.getTime();
        }

        return true;
      })
      .map(s => s.toISOString().slice(11, 16));

    return {
      barber: barber.name,
      service: service.name,
      date,
      availableTimes
    }
  },

  // 🔹 Cria um agendamento para um cliente novo ou existente
  createAppointment: async ({ barberId, serviceId, date, time, customerName, customerPhone, customerEmail }) => {
    const barber = await barberService.findById(barberId);
    const dayOfWeek = new Date(date).getDay();
    const schedule = await barberService.getScheduleByDay(barberId, dayOfWeek);

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) throw new Error('Serviço não encontrado.');

    const appointmentStart = timeUtils.createDateTime(date, time);
    const appointmentEnd = addMinutes(appointmentStart, service.duration);

    const scheduleStart = timeUtils.createDateTime(date, schedule.startTime);
    const scheduleEnd = timeUtils.createDateTime(date, schedule.endTime);

    if (appointmentStart < scheduleStart || appointmentEnd > scheduleEnd) {
      const err = new Error('Horário fora da agenda do barbeiro.');
      err.status = 400;
      throw err;
    }

    // 🔹 Busca cliente existente pelo telefone
    let customer = await prisma.customer.findUnique({ where: { email: customerEmail, phone: customerPhone } });

    if (customer) {
      // impede usar telefone de outro cliente
      if (customer.name !== customerName) {
        const err = new Error('Email e número de telefone já estão associados a outro cliente.');
        err.status = 400;
        throw err;
      }
    } else {
      // cria cliente se não existir
      customer = await customerService.create({ name: customerName, phone: customerPhone, email: customerEmail });
    }

    // 🔹 Verifica duplicidade de agendamento do mesmo cliente
    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        customerId: customer.id,
        date: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
      include: { service: true },
    });

    for (const existing of sameDayAppointments) {
      const existingStart = existing.date;
      const existingEnd = addMinutes(existingStart, existing.service.duration);
      const overlaps =
        (appointmentStart < existingEnd && appointmentEnd > existingStart) ||
        (existingStart < appointmentEnd && existingEnd > appointmentStart);

      if (overlaps) {
        const err = new Error('Este cliente já possui um agendamento nesse horário.');
        err.status = 400;
        throw err;
      }
    }

    // 🔹 Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: { barberId, serviceId, customerId: customer.id, date: appointmentStart, time, status: 'PENDING' },
      include: { barber: true, service: true, customer: true },
      omit: { barber: { password: true } },
    });

    // Envia e-mail
    emailService.sendAppointmentCreated({
      customerName: customer.name,
      customerEmail: customer.email,
      date: appointment.date,
      serviceName: service.name,
    });

    emailService.notifyBarberNewAppointment({
      barberName: barber.name,
      customerName: customer.name,
      date: appointment.date,
      serviceName: service.name,
    });

    return appointment;
  },

  // 🔹 Retorna um agendamento específico
  getAppointmentById: async (id) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { barber: true, service: true, customer: true },
    });

    if (!appointment) {
      const err = new Error('Agendamento não encontrado.');
      err.status = 404;
      throw err;
    }

    return appointment;
  },
};
