export function appointmentCancelledEmail({ customerName, date, service }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Olá, ${customerName}!</h2>
      <p>O seu agendamento foi <strong style="color: red;">CANCELADO</strong>.</p>

      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Serviço:</strong> ${service}</p>

      <p>Se precisar, você pode marcar novamente a qualquer momento.</p>
    </div>
  `;
}

export function barberAppointmentCancelledEmail({ barberName, customerName, date, service }) {
  return `
    <h2>❌ Agendamento cancelado</h2>

    <p>Olá <strong>${barberName}</strong>,</p>

    <p>Agendamento cancelado para <strong>${customerName}</strong>.</p>

    <p>
      <strong>Serviço:</strong> ${service}<br>
      <strong>Data:</strong> ${date}
    </p>
  `;
}