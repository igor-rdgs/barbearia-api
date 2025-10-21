import { barberService } from '../services/barberService.js';

export async function listarBarbeiros(req, res) {
  try {
    const barbers = await barberService.listar();
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
}

export async function buscarBarbeiroPorId(req, res) {
  try {
    const barber = await barberService.buscarPorId(Number(req.params.id));
    res.json(barber);
  } catch (err) {
    res.status(404).json({ mensagem: err.message });
  }
}
