const BaseRepository = require('./baseRepository');

class QuizAttemptRepository extends BaseRepository {
  constructor() {
    super('quizAttempts.json');
  }

  findByQuizId(quizId) {
    return this.findWhere(a => a.quizId === quizId);
  }

  findByStudentId(studentId) {
    return this.findWhere(a => a.studentId === studentId);
  }

  findByQuizAndStudent(quizId, studentId) {
    return this.findWhere(a => a.quizId === quizId && a.studentId === studentId)[0] || null;
  }
}

module.exports = new QuizAttemptRepository();
