const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const coordinatorRepo = require('../repositories/coordinatorRepository');
const teacherRepo = require('../repositories/teacherRepository');
const studentRepo = require('../repositories/studentRepository');

const REPO_BY_ROLE = {
  coordenacao: coordinatorRepo,
  professor: teacherRepo,
  aluno: studentRepo,
};

function getAllUsers() {
  const coords = coordinatorRepo.readAll().map(u => ({ ...u, password: undefined }));
  const teachers = teacherRepo.readAll().map(u => ({ ...u, password: undefined }));
  const students = studentRepo.readAll().map(u => ({ ...u, password: undefined }));
  return [...coords, ...teachers, ...students];
}

async function createUser(data) {
  const { name, email, password, role, classId, classIds, subjects } = data;
  if (!name || !email || !password || !role) {
    throw Object.assign(new Error('Campos obrigatórios: name, email, password, role'), { status: 400 });
  }
  const repo = REPO_BY_ROLE[role];
  if (!repo) throw Object.assign(new Error('Papel inválido'), { status: 400 });

  if (repo.findByEmail(email)) {
    throw Object.assign(new Error('Email já cadastrado'), { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: `${role === 'coordenacao' ? 'coord' : role === 'professor' ? 'teacher' : 'student'}-${uuidv4().slice(0, 8)}`,
    name,
    email,
    password: hashed,
    role,
    createdAt: new Date().toISOString(),
  };
  if (role === 'aluno' && classId) user.classId = classId;
  if (role === 'professor') {
    user.classIds = classIds || [];
    user.subjects = subjects || [];
  }

  repo.create(user);
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

async function updateUser(id, updates) {
  // Find user in any repo
  let repo = null;
  let existing = null;
  for (const r of Object.values(REPO_BY_ROLE)) {
    existing = r.findById(id);
    if (existing) { repo = r; break; }
  }
  if (!existing) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  // Disallow changing role
  delete updates.role;
  delete updates.id;

  const updated = repo.update(id, updates);
  const { password: _pw, ...safeUser } = updated;
  return safeUser;
}

function deleteUser(id) {
  for (const repo of Object.values(REPO_BY_ROLE)) {
    if (repo.findById(id)) {
      repo.delete(id);
      return true;
    }
  }
  throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
}

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
