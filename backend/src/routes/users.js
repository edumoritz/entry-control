const express = require('express');
const jwt = require('jwt-simple');
const { secret } = require('../../.env');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.user.findAll()
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.user.findOne({ id: req.params.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', async (req, res, next) => {
    let reqHeader = req.headers.authorization;
    try {
      var decoded = jwt.decode(reqHeader.split(' ')[1], secret.key);
      const result = await app.services.user.save(req.body, decoded.id);
      return res.status(201).json(result[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
 