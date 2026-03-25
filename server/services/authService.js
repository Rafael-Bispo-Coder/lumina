const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const coordinatorRepo = require('../repositories/coordinatorRepository');
const teacherRepo = require('../repositories/teacherRepository');
const studentRepo = require('../repositories/studentRepository');

const REPO_BY_ROLE = {
  coordenacao: coordinatorRepo,
  professor: teacherRepo,
  aluno: studentRepo,
};

async function login(email, password, role) {
  const repo = REPO_BY_ROLE[role];
  if (!repo) throw Object.assign(new Error('Papel inválido'), { status: 400 });

  const user = repo.findByEmail(email);
  if (!user) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  if (role === 'aluno') payload.classId = user.classId;
  if (role === 'professor') payload.classIds = user.classIds;

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'lumina_secret_key_change_in_production', {
    expiresIn: '24h',
  });

  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
}

module.exports = { login };
