import { mailer } from "../config/mail.js";
import {
  appointmentCreatedEmail, barberNewAppointmentEmail
} from "../emails/appointmentCreated.js";
import {
  appointmentConfirmedEmail,
} from "../emails/appointmentConfirmed.js";
import {
  appointmentCancelledEmail, barberAppointmentCancelledEmail
} from "../emails/appointmentCancelled.js";
import { formatDate } from "../utils/formatDate.js";

export const emailService = {
  async sendAppointmentCreated(appointment) {
    await mailer.sendMail({
      from: `"Barbearia" <${process.env.EMAIL_USER}>`,
      to: appointment.customerEmail,
      subject: "Agendamento criado ✔️",
      html: appointmentCreatedEmail({
        customerName: appointment.customerName,
        date: formatDate(appointment.date),
        service: appointment.serviceName,
      }),
    });
  },

  async sendAppointmentConfirmed(appointment) {
    await mailer.sendMail({
      from: `"Barbearia" <${process.env.EMAIL_USER}>`,
      to: appointment.customerEmail,
      subject: "Agendamento confirmado ✔️",
      html: appointmentConfirmedEmail({
        customerName: appointment.customerName,
        date: formatDate(appointment.date),
        service: appointment.serviceName,
      }),
    });
  },

  async sendAppointmentCancelled(appointment) {
    await mailer.sendMail({
      from: `"Barbearia" <${process.env.EMAIL_USER}>`,
      to: appointment.customerEmail,
      subject: "Agendamento cancelado ❌",
      html: appointmentCancelledEmail({
        customerName: appointment.customerName,
        date: formatDate(appointment.date),
        service: appointment.serviceName,
      }),
    });
  },

  async notifyBarberNewAppointment(appointment) {
    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: 'ig.aguiar1998@gmail.com',
      subject: "Novo agendamento recebido",
      html: barberNewAppointmentEmail({
        barberName: appointment.barberName,
        customerName: appointment.customerName,
        date: formatDate(appointment.date),
        service: appointment.serviceName,
      }),
    });
  },

  async notifyBarberCancelled(appointment) {
    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: 'ig.aguiar1998@gmail.com',
      subject: "Um agendamento foi cancelado",
      html: barberAppointmentCancelledEmail({
        barberName: appointment.barberName,
        customerName: appointment.customerName,
        date: formatDate(appointment.date),
        service: appointment.serviceName,
      }),
    });
  },
}
