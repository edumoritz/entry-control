const app = require('../../app');

exports.seed = function (knex) {
  return app.services.user.save({
    name: 'Admin',
    last_name: 'Master',
    mail: "master@master.com",
    cpf: "00000000000",
    dt_birth: new Date("01/01/2001"),
    phone: "",
    admin: true,
    passwd: "admin"
  });
}