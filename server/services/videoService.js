const { v4: uuidv4 } = require('uuid');
const videoRepo = require('../repositories/videoRepository');
const videoViewRepo = require('../repositories/videoViewRepository');
const classRepo = require('../repositories/classRepository');
const studentRepo = require('../repositories/studentRepository');

function getVideos(user) {
  if (user.role === 'coordenacao') return videoRepo.readAll();
  if (user.role === 'professor') return videoRepo.findByTeacherId(user.id);
  if (user.role === 'aluno') return videoRepo.findByClassId(user.classId);
  return [];
}

function createVideo(data, user) {
  const { title, description, url, classId, subject } = data;
  if (!title || !url || !classId) {
    throw Object.assign(new Error('Campos obrigatórios: title, url, classId'), { status: 400 });
  }
  const video = {
    id: `video-${uuidv4().slice(0, 8)}`,
    title,
    description: description || '',
    url,
    classId,
    teacherId: user.role === 'professor' ? user.id : (data.teacherId || null),
    subject: subject || '',
    createdAt: new Date().toISOString(),
  };
  return videoRepo.create(video);
}

function updateVideo(id, updates, user) {
  const video = videoRepo.findById(id);
  if (!video) throw Object.assign(new Error('Vídeo não encontrado'), { status: 404 });
  if (user.role === 'professor' && video.teacherId !== user.id) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  delete updates.id;
  return videoRepo.update(id, updates);
}

function deleteVideo(id, user) {
  const video = videoRepo.findById(id);
  if (!video) throw Object.assign(new Error('Vídeo não encontrado'), { status: 404 });
  if (user.role === 'professor' && video.teacherId !== user.id) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  videoRepo.delete(id);
  return true;
}

function getVideoViews(videoId) {
  const video = videoRepo.findById(videoId);
  if (!video) throw Object.assign(new Error('Vídeo não encontrado'), { status: 404 });

  const cls = classRepo.findById(video.classId);
  const studentIds = cls ? cls.studentIds : [];
  const views = videoViewRepo.findByVideoId(videoId);
  const viewedMap = {};
  views.forEach(v => { viewedMap[v.studentId] = v; });

  const result = studentIds.map(sid => {
    const student = studentRepo.findById(sid);
    const view = viewedMap[sid];
    return {
      studentId: sid,
      studentName: student ? student.name : 'Desconhecido',
      viewed: !!view,
      progress: view ? view.progress : 0,
      completed: view ? view.completed : false,
      viewedAt: view ? view.viewedAt : null,
    };
  });
  return result;
}

function recordVideoView(videoId, studentId, data) {
  const video = videoRepo.findById(videoId);
  if (!video) throw Object.assign(new Error('Vídeo não encontrado'), { status: 404 });

  const existing = videoViewRepo.findByVideoAndStudent(videoId, studentId);
  const now = new Date().toISOString();
  if (existing) {
    return videoViewRepo.update(existing.id, {
      progress: data.progress !== undefined ? data.progress : existing.progress,
      completed: data.completed !== undefined ? data.completed : existing.completed,
      viewedAt: now,
    });
  }
  return videoViewRepo.create({
    id: `vv-${uuidv4().slice(0, 8)}`,
    videoId,
    studentId,
    progress: data.progress || 0,
    completed: data.completed || false,
    viewedAt: now,
  });
}

module.exports = { getVideos, createVideo, updateVideo, deleteVideo, getVideoViews, recordVideoView };
