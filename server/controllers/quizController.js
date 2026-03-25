const quizService = require('../services/quizService');

function listQuizzes(req, res, next) {
  try {
    res.json(quizService.getQuizzes(req.user));
  } catch (err) { next(err); }
}

function createQuiz(req, res, next) {
  try {
    const quiz = quizService.createQuiz(req.body, req.user);
    res.status(201).json(quiz);
  } catch (err) { next(err); }
}

function updateQuiz(req, res, next) {
  try {
    const quiz = quizService.updateQuiz(req.params.id, req.body, req.user);
    res.json(quiz);
  } catch (err) { next(err); }
}

function deleteQuiz(req, res, next) {
  try {
    quizService.deleteQuiz(req.params.id, req.user);
    res.json({ message: 'Quiz removido' });
  } catch (err) { next(err); }
}

function getAttempts(req, res, next) {
  try {
    res.json(quizService.getQuizAttempts(req.params.id));
  } catch (err) { next(err); }
}

async function submitAttempt(req, res, next) {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Campo obrigatório: answers (array)' });
    }
    const attempt = quizService.submitQuizAttempt(req.params.id, req.user.id, answers);
    res.status(201).json(attempt);
  } catch (err) { next(err); }
}

module.exports = { listQuizzes, createQuiz, updateQuiz, deleteQuiz, getAttempts, submitAttempt };
