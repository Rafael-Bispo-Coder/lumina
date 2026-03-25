const { v4: uuidv4 } = require('uuid');
const classRepo = require('../repositories/classRepository');
const teacherRepo = require('../repositories/teacherRepository');
const studentRepo = require('../repositories/studentRepository');

function getClasses(user) {
  if (user.role === 'coordenacao') return classRepo.readAll();
  if (user.role === 'professor') return classRepo.findByTeacherId(user.id);
  if (user.role === 'aluno') return classRepo.findByStudentId(user.id);
  return [];
}

function createClass(data) {
  const { name, teacherId, subjects } = data;
  if (!name) throw Object.assign(new Error('Campo obrigatório: name'), { status: 400 });
  const cls = {
    id: `class-${uuidv4().slice(0, 8)}`,
    name,
    teacherId: teacherId || null,
    studentIds: [],
    subjects: subjects || [],
    createdAt: new Date().toISOString(),
  };
  return classRepo.create(cls);
}

function updateClass(id, updates) {
  const existing = classRepo.findById(id);
  if (!existing) throw Object.assign(new Error('Turma não encontrada'), { status: 404 });
  delete updates.id;
  return classRepo.update(id, updates);
}

function deleteClass(id) {
  if (!classRepo.findById(id)) throw Object.assign(new Error('Turma não encontrada'), { status: 404 });
  classRepo.delete(id);
  return true;
}

function getStudentsOfClass(classId, user) {
  const cls = classRepo.findById(classId);
  if (!cls) throw Object.assign(new Error('Turma não encontrada'), { status: 404 });
  if (user.role === 'professor' && cls.teacherId !== user.id) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  return cls.studentIds.map(sid => {
    const s = studentRepo.findById(sid);
    if (!s) return null;
    const { password: _pw, ...safe } = s;
    return safe;
  }).filter(Boolean);
}

module.exports = { getClasses, createClass, updateClass, deleteClass, getStudentsOfClass };
