// TODO: migrate to database - replace file I/O with DB queries
const fs = require('fs');
const path = require('path');

class BaseRepository {
  constructor(filename) {
    this.filepath = path.join(__dirname, '../data', filename);
  }

  readAll() {
    try {
      const raw = fs.readFileSync(this.filepath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  findById(id) {
    return this.readAll().find(item => item.id === id) || null;
  }

  create(data) {
    const all = this.readAll();
    all.push(data);
    this._write(all);
    return data;
  }

  update(id, updates) {
    const all = this.readAll();
    const idx = all.findIndex(item => item.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    this._write(all);
    return all[idx];
  }

  delete(id) {
    const all = this.readAll();
    const filtered = all.filter(item => item.id !== id);
    if (filtered.length === all.length) return false;
    this._write(filtered);
    return true;
  }

  findWhere(predicate) {
    return this.readAll().filter(predicate);
  }
}

module.exports = BaseRepository;
