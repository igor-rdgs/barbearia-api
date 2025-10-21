import { customerService } from '../services/customerService.js';

export async function listarClientes(req, res) {
  try {
    const customers = await customerService.listar();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
}

export async function buscarClientePorId(req, res) {
  try {
    const customer = await customerService.buscarPorId(Number(req.params.id));
    res.json(customer);
  } catch (err) {
    res.status(404).json({ mensagem: err.message });
  }
}

export async function criarCliente(req, res) {
  try {
    const { name, phone, email } = req.body;
    const customer = await customerService.criar({ name, phone, email });
    res.status(201).json({ mensagem: 'Cliente criado com sucesso.', customer });
  } catch (err) {
    res.status(400).json({ mensagem: err.message });
  }
}
