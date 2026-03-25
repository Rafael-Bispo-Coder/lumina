const BaseRepository = require('./baseRepository');

class GradeRepository extends BaseRepository {
  constructor() {
    super('gradeRecords.json');
  }

  findByStudentId(studentId) {
    return this.findWhere(g => g.studentId === studentId);
  }

  findByClassId(classId) {
    return this.findWhere(g => g.classId === classId);
  }

  findByStudentAndClass(studentId, classId) {
    return this.findWhere(g => g.studentId === studentId && g.classId === classId);
  }
}

module.exports = new GradeRepository();
