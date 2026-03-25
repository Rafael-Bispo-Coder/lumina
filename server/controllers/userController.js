const userService = require('../services/userService');

async function listUsers(req, res, next) {
  try {
    res.json(userService.getAllUsers());
  } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    userService.deleteUser(req.params.id);
    res.json({ message: 'Usuário removido' });
  } catch (err) { next(err); }
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
