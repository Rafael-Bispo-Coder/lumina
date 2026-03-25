const BaseRepository = require('./baseRepository');

class VideoRepository extends BaseRepository {
  constructor() {
    super('videos.json');
  }

  findByClassId(classId) {
    return this.findWhere(v => v.classId === classId);
  }

  findByTeacherId(teacherId) {
    return this.findWhere(v => v.teacherId === teacherId);
  }
}

module.exports = new VideoRepository();
