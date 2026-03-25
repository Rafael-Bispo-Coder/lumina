const gradeService = require('../services/gradeService');

function listGrades(req, res, next) {
  try {
    const { period, subject, type } = req.query;
    res.json(gradeService.getGrades(req.user, { period, subject, type }));
  } catch (err) { next(err); }
}

function getGradesSummary(req, res, next) {
  try {
    res.json(gradeService.getGradesSummary(req.user.id));
  } catch (err) { next(err); }
}

module.exports = { listGrades, getGradesSummary };
