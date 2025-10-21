import { appointmentService } from '../services/appointmentService.js';

export async function listarAgendamentos(req, res) {
  try {
    const appointments = await appointmentService.listar();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
}

export async function criarAgendamento(req, res) {
  try {
    const appointment = await appointmentService.criar(req.body);
    res.status(201).json({ mensagem: 'Agendamento criado com sucesso.', appointment });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}

export async function confirmarAgendamento(req, res) {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.confirmar(Number(id));
    res.json({ mensagem: 'Agendamento confirmado.', appointment });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}

export async function cancelarAgendamento(req, res) {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.cancelar(Number(id));
    res.json({ mensagem: 'Agendamento cancelado.', appointment });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}
