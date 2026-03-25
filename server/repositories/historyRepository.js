const BaseRepository = require('./baseRepository');

class HistoryRepository extends BaseRepository {
  constructor() {
    super('historyEvents.json');
  }

  findByStudentId(studentId) {
    return this.findWhere(h => h.studentId === studentId);
  }
}

module.exports = new HistoryRepository();
