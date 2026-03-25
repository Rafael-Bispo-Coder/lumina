const historyRepo = require('../repositories/historyRepository');

function getHistory(user, filters = {}) {
  let events = historyRepo.findByStudentId(user.id);

  if (filters.type) events = events.filter(e => e.type === filters.type);
  if (filters.subject) events = events.filter(e => e.subject === filters.subject);
  if (filters.period) {
    const cutoff = getPeriodCutoff(filters.period);
    if (cutoff) events = events.filter(e => new Date(e.date) >= cutoff);
  }

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getPeriodCutoff(period) {
  const now = new Date();
  if (period === '7d') return new Date(now - 7 * 24 * 3600 * 1000);
  if (period === '30d') return new Date(now - 30 * 24 * 3600 * 1000);
  if (period === '90d') return new Date(now - 90 * 24 * 3600 * 1000);
  return null;
}

module.exports = { getHistory };
