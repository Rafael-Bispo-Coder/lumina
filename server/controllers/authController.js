const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios: email, password, role' });
    }
    const result = await authService.login(email, password, role);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.json({ message: 'Logout realizado com sucesso' });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, me };
