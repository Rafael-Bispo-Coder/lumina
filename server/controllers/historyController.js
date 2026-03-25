const historyService = require('../services/historyService');

function listHistory(req, res, next) {
  try {
    const { period, subject, type } = req.query;
    res.json(historyService.getHistory(req.user, { period, subject, type }));
  } catch (err) { next(err); }
}

module.exports = { listHistory };
