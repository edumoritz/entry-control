const express = require('express');
const jwt = require('jwt-simple');
const { secret } = require('../../.env');
const RecursoIndevidoError = require('../errors/RecursoIndevidoError');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', (req, res, next) => {
    app.services.schedule.findOne({ id: req.params.id })
      .then((sh) => {
        if (!sh) throw new ValidationError('This schedule was not found.');
        if (sh.user_id !== req.user.id) throw new RecursoIndevidoError();
        else next();
      }).catch(err => next(err));
  });

  router.get('/', (req, res, next) => {
    app.services.schedule.findAll({ user_id: req.user.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.schedule.findOne({ id: req.params.id })
      .then((result) => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', (req, res, next) => {
    app.services.schedule.save({ ...req.body, user_id: req.user.id })
      .then((result) => {
        return res.status(201).json(result[0]);
      }).catch(err => next(err));
  });

  router.put('/:id', async (req, res, next) => {
    let reqHeader = req.headers.authorization;
    var decoded = jwt.decode(reqHeader.split(' ')[1], secret.key);
    app.services.schedule.update(req.params.id, req.body, decoded.id)
      .then(result => res.status(200).json(result[0]))
      .catch(err => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.schedule.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch(err => next(err));
  });

  return router;
}