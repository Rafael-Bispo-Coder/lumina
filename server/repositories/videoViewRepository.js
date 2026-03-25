const BaseRepository = require('./baseRepository');

class VideoViewRepository extends BaseRepository {
  constructor() {
    super('videoViews.json');
  }

  findByVideoId(videoId) {
    return this.findWhere(vv => vv.videoId === videoId);
  }

  findByStudentId(studentId) {
    return this.findWhere(vv => vv.studentId === studentId);
  }

  findByVideoAndStudent(videoId, studentId) {
    return this.findWhere(vv => vv.videoId === videoId && vv.studentId === studentId)[0] || null;
  }
}

module.exports = new VideoViewRepository();
