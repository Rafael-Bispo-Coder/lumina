const videoService = require('../services/videoService');

function listVideos(req, res, next) {
  try {
    res.json(videoService.getVideos(req.user));
  } catch (err) { next(err); }
}

function createVideo(req, res, next) {
  try {
    const video = videoService.createVideo(req.body, req.user);
    res.status(201).json(video);
  } catch (err) { next(err); }
}

function updateVideo(req, res, next) {
  try {
    const video = videoService.updateVideo(req.params.id, req.body, req.user);
    res.json(video);
  } catch (err) { next(err); }
}

function deleteVideo(req, res, next) {
  try {
    videoService.deleteVideo(req.params.id, req.user);
    res.json({ message: 'Vídeo removido' });
  } catch (err) { next(err); }
}

function getViews(req, res, next) {
  try {
    res.json(videoService.getVideoViews(req.params.id));
  } catch (err) { next(err); }
}

function recordView(req, res, next) {
  try {
    const view = videoService.recordVideoView(req.params.id, req.user.id, req.body);
    res.status(201).json(view);
  } catch (err) { next(err); }
}

module.exports = { listVideos, createVideo, updateVideo, deleteVideo, getViews, recordView };
