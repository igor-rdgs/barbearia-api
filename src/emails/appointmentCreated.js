export function appointmentCreatedEmail({ customerName, date, service }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Olá, ${customerName}!</h2>
      <p>Seu agendamento foi registrado com sucesso.</p>
      
      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Serviço:</strong> ${service}</p>
        
      <p>Em breve enviaremos um e-mail com a confirmação do serviço.</p>
      <p>Obrigado por escolher nossa barbearia!</p>
    </div>
  `;
}

export function barberNewAppointmentEmail({ barberName, customerName, date, service }) {
  return `
    <h2>📅 Novo agendamento!</h2>

    <p>Olá <strong>${barberName}</strong>,</p>

    <p>Um novo agendamento foi criado:</p>

    <p>
      <strong>Cliente:</strong> ${customerName}<br>
      <strong>Serviço:</strong> ${service}<br>
      <strong>Data:</strong> ${date}
    </p>

    <p>Por favor, revise o painel da barbearia.</p>
  `;
}