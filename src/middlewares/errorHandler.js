export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ mensagem: 'Ocorreu um erro no servidor.' });
}
