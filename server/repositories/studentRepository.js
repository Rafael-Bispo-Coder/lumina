const BaseRepository = require('./baseRepository');

class StudentRepository extends BaseRepository {
  constructor() {
    super('students.json');
  }

  findByEmail(email) {
    return this.findWhere(s => s.email === email)[0] || null;
  }

  findByClassId(classId) {
    return this.findWhere(s => s.classId === classId);
  }
}

module.exports = new StudentRepository();
