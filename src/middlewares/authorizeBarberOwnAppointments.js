export const authorizeBarberOwnAppointments = (req, res, next) => {
  const { user, appointment } = req;

  if (user.role === 'ADMIN') return next();

  if (user.role === 'BARBER') {
    if (appointment.barberId === user.id) return next();

    return res.status(403).json({
      error: 'Você não pode gerenciar agendamentos de outros barbeiros.'
    });
  }

  return res.status(403).json({ error: 'Acesso não autorizado.' });
};
