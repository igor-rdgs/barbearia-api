export function appointmentConfirmedEmail({ customerName, date, service }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Olá, ${customerName}!</h2>
      <p>Seu agendamento foi <strong style="color: green;">CONFIRMADO</strong>.</p>
      
      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Serviço:</strong> ${service}</p>

      <p>Esperamos você na hora marcada!</p>
    </div>
  `;
}