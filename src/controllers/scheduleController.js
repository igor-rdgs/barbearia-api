import { scheduleService } from '../services/scheduleService.js';

export async function listarHorarios(req, res) {
  try {
    const { barberId } = req.params;
    const schedules = await scheduleService.listarPorBarbeiro(barberId);
    res.json(schedules);
  } catch (err) {
    res.status(404).json({ mensagem: err.message });
  }
}

export async function criarHorario(req, res) {
  try {
    const schedule = await scheduleService.criar(req.body);
    res.status(201).json({ mensagem: 'Horário criado com sucesso.', schedule });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}

export async function atualizarHorario(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.atualizar({ id: Number(id), ...req.body });
    res.json({ mensagem: 'Horário atualizado com sucesso.', schedule });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}

export async function deletarHorario(req, res) {
  try {
    const { id } = req.params;
    await scheduleService.deletar(Number(id));
    res.json({ mensagem: 'Horário deletado com sucesso.' });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}
