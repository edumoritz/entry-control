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
  }).then(() => app.services.user.save({
    name: 'Admin 2',
    last_name: 'Master 2',
    mail: "master2@master.com",
    cpf: "00000000001",
    dt_birth: new Date("01/01/2001"),
    phone: "",
    admin: true,
    passwd: "admin2"
  })).then(() => app.services.user.save({
    name: 'User',
    last_name: 'Only User',
    mail: "user@mail.com",
    cpf: "00000000002",
    dt_birth: new Date("01/01/2001"),
    phone: "",
    admin: false,
    passwd: "user123"
  }))
}