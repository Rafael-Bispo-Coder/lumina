const BaseRepository = require('./baseRepository');

class ClassRepository extends BaseRepository {
  constructor() {
    super('classes.json');
  }

  findByTeacherId(teacherId) {
    return this.findWhere(c => c.teacherId === teacherId);
  }

  findByStudentId(studentId) {
    return this.findWhere(c => c.studentIds && c.studentIds.includes(studentId));
  }
}

module.exports = new ClassRepository();
