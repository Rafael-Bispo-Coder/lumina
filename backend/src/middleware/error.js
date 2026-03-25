export const errorHandler = (err, _req, res, _next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Dados inválidos.', issues: err.issues });
  }

  if (err?.code === 'P2002') {
    return res.status(409).json({ message: 'Conflito de dados únicos.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
};
