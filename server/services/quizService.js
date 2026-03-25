const { v4: uuidv4 } = require('uuid');
const quizRepo = require('../repositories/quizRepository');
const quizAttemptRepo = require('../repositories/quizAttemptRepository');
const classRepo = require('../repositories/classRepository');
const studentRepo = require('../repositories/studentRepository');
const gradeRepo = require('../repositories/gradeRepository');
const historyRepo = require('../repositories/historyRepository');

function getQuizzes(user) {
  if (user.role === 'coordenacao') return quizRepo.readAll();
  if (user.role === 'professor') return quizRepo.findByTeacherId(user.id);
  if (user.role === 'aluno') return quizRepo.findByClassId(user.classId);
  return [];
}

function createQuiz(data, user) {
  const { title, classId, subject, questions, dueDate } = data;
  if (!title || !classId || !questions || !Array.isArray(questions)) {
    throw Object.assign(new Error('Campos obrigatórios: title, classId, questions'), { status: 400 });
  }
  const quiz = {
    id: `quiz-${uuidv4().slice(0, 8)}`,
    title,
    classId,
    teacherId: user.role === 'professor' ? user.id : (data.teacherId || null),
    subject: subject || '',
    questions,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  };
  return quizRepo.create(quiz);
}

function updateQuiz(id, updates, user) {
  const quiz = quizRepo.findById(id);
  if (!quiz) throw Object.assign(new Error('Quiz não encontrado'), { status: 404 });
  if (user.role === 'professor' && quiz.teacherId !== user.id) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  delete updates.id;
  return quizRepo.update(id, updates);
}

function deleteQuiz(id, user) {
  const quiz = quizRepo.findById(id);
  if (!quiz) throw Object.assign(new Error('Quiz não encontrado'), { status: 404 });
  if (user.role === 'professor' && quiz.teacherId !== user.id) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  quizRepo.delete(id);
  return true;
}

function getQuizAttempts(quizId) {
  const quiz = quizRepo.findById(quizId);
  if (!quiz) throw Object.assign(new Error('Quiz não encontrado'), { status: 404 });

  const cls = classRepo.findById(quiz.classId);
  const studentIds = cls ? cls.studentIds : [];
  const attempts = quizAttemptRepo.findByQuizId(quizId);
  const attemptMap = {};
  attempts.forEach(a => { attemptMap[a.studentId] = a; });

  return studentIds.map(sid => {
    const student = studentRepo.findById(sid);
    const attempt = attemptMap[sid];
    return {
      studentId: sid,
      studentName: student ? student.name : 'Desconhecido',
      attempted: !!attempt,
      score: attempt ? attempt.score : null,
      status: attempt ? attempt.status : 'pendente',
      submittedAt: attempt ? attempt.submittedAt : null,
    };
  });
}

function submitQuizAttempt(quizId, studentId, answers) {
  const quiz = quizRepo.findById(quizId);
  if (!quiz) throw Object.assign(new Error('Quiz não encontrado'), { status: 404 });

  const existing = quizAttemptRepo.findByQuizAndStudent(quizId, studentId);
  if (existing) throw Object.assign(new Error('Quiz já respondido'), { status: 409 });

  // Auto-grade
  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  const score = quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0;
  const now = new Date().toISOString();

  const attempt = quizAttemptRepo.create({
    id: `qa-${uuidv4().slice(0, 8)}`,
    quizId,
    studentId,
    score,
    answers,
    status: 'corrigido',
    submittedAt: now,
    gradedAt: now,
  });

  // Record grade
  gradeRepo.create({
    id: `gr-${uuidv4().slice(0, 8)}`,
    studentId,
    classId: quiz.classId,
    subject: quiz.subject,
    type: 'quiz',
    refId: quizId,
    title: quiz.title,
    score,
    maxScore: 100,
    status: 'corrigido',
    date: now,
  });

  // Record history
  historyRepo.create({
    id: `he-${uuidv4().slice(0, 8)}`,
    studentId,
    type: 'quiz_attempt',
    refId: quizId,
    title: `Fez: ${quiz.title}`,
    subject: quiz.subject,
    date: now,
    status: 'corrigido',
  });

  return attempt;
}

module.exports = { getQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizAttempts, submitQuizAttempt };
