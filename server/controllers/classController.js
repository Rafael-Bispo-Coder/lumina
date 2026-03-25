const classService = require('../services/classService');

function listClasses(req, res, next) {
  try {
    res.json(classService.getClasses(req.user));
  } catch (err) { next(err); }
}

function createClass(req, res, next) {
  try {
    const cls = classService.createClass(req.body);
    res.status(201).json(cls);
  } catch (err) { next(err); }
}

function updateClass(req, res, next) {
  try {
    const cls = classService.updateClass(req.params.id, req.body);
    res.json(cls);
  } catch (err) { next(err); }
}

function deleteClass(req, res, next) {
  try {
    classService.deleteClass(req.params.id);
    res.json({ message: 'Turma removida' });
  } catch (err) { next(err); }
}

function getClassStudents(req, res, next) {
  try {
    const students = classService.getStudentsOfClass(req.params.id, req.user);
    res.json(students);
  } catch (err) { next(err); }
}

module.exports = { listClasses, createClass, updateClass, deleteClass, getClassStudents };
