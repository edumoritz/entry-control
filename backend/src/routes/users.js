const express = require('express');
const jwt = require('jwt-simple');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.user.findAll()
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', async (req, res, next) => {
    const userAdmin = decodeToken(req.headers.authorization.split(' ')[1]);
    try {
      const result = await app.services.user.save(req.body, userAdmin);
      return res.status(201).json(result[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
 
function decodeToken(token) {
  var decoded = jwt.decode(token, 'Segredo!', 'HS256');
  return decoded.admin;
}