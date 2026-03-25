const gradeRepo = require('../repositories/gradeRepository');
const classRepo = require('../repositories/classRepository');

function getGrades(user, filters = {}) {
  let grades = [];
  if (user.role === 'aluno') {
    grades = gradeRepo.findByStudentId(user.id);
  } else if (user.role === 'professor') {
    const classes = classRepo.findByTeacherId(user.id);
    const classIds = classes.map(c => c.id);
    grades = gradeRepo.findWhere(g => classIds.includes(g.classId));
  } else if (user.role === 'coordenacao') {
    grades = gradeRepo.readAll();
  }

  if (filters.subject) grades = grades.filter(g => g.subject === filters.subject);
  if (filters.type) grades = grades.filter(g => g.type === filters.type);
  if (filters.period) {
    const cutoff = getPeriodCutoff(filters.period);
    if (cutoff) grades = grades.filter(g => new Date(g.date) >= cutoff);
  }

  return grades;
}

function getGradesSummary(studentId) {
  const grades = gradeRepo.findByStudentId(studentId).filter(g => g.status === 'corrigido');
  if (grades.length === 0) return { overall: 0, bySubject: {} };

  const overall = Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length);
  const bySubject = {};
  grades.forEach(g => {
    if (!bySubject[g.subject]) bySubject[g.subject] = { total: 0, count: 0 };
    bySubject[g.subject].total += g.score;
    bySubject[g.subject].count += 1;
  });
  Object.keys(bySubject).forEach(s => {
    bySubject[s] = Math.round(bySubject[s].total / bySubject[s].count);
  });
  return { overall, bySubject };
}

function getPeriodCutoff(period) {
  const now = new Date();
  if (period === '7d') return new Date(now - 7 * 24 * 3600 * 1000);
  if (period === '30d') return new Date(now - 30 * 24 * 3600 * 1000);
  if (period === '90d') return new Date(now - 90 * 24 * 3600 * 1000);
  return null;
}

module.exports = { getGrades, getGradesSummary };
