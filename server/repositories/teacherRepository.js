const BaseRepository = require('./baseRepository');

class TeacherRepository extends BaseRepository {
  constructor() {
    super('teachers.json');
  }

  findByEmail(email) {
    return this.findWhere(t => t.email === email)[0] || null;
  }

  findByClassId(classId) {
    return this.findWhere(t => t.classIds && t.classIds.includes(classId));
  }
}

module.exports = new TeacherRepository();
