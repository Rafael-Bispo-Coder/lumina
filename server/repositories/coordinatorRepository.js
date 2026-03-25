const BaseRepository = require('./baseRepository');

class CoordinatorRepository extends BaseRepository {
  constructor() {
    super('coordinators.json');
  }

  findByEmail(email) {
    return this.findWhere(c => c.email === email)[0] || null;
  }
}

module.exports = new CoordinatorRepository();
