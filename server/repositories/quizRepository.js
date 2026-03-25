const BaseRepository = require('./baseRepository');

class QuizRepository extends BaseRepository {
  constructor() {
    super('quizzes.json');
  }

  findByClassId(classId) {
    return this.findWhere(q => q.classId === classId);
  }

  findByTeacherId(teacherId) {
    return this.findWhere(q => q.teacherId === teacherId);
  }
}

module.exports = new QuizRepository();
