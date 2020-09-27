const request = require('supertest');
const jwt = require('jwt-simple');
const { genCpf } = require('../utils');
const { secret } = require('../../.env');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';
const genMail = `${Date.now()}@mail.com`;
let user;
let authUser;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'Admin',
    last_name: 'Silverio',
    mail: genMail,
    cpf: genCpf(),
    dt_birth: new Date(),
    phone: '12345678910',
    admin: true,
    passwd: '$2a$10$Xa9J4TaR2v9E27P/4BpMzuiKJomJuXh58.LhKJdQLW43pKyGXEo6.'
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret.key);

  const res2 = await app.services.user.save({
    name: 'NoAdmin',
    last_name: 'Silverio',
    mail: `${Date.now()}@mail.com`,
    cpf: genCpf(),
    dt_birth: new Date(),
    phone: '12345678910',
    admin: false,
    passwd: '$2a$10$WREIWEtqxidJI7RvFzLlbu.KenH25aK87QDomtqfZCPrsjSlVyj/6'
  });
  authUser = { ...res2[0] };
  authUser.token = jwt.encode(authUser, secret.key);
})

test('Should list all users', () => {

  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    })
});

test('Should insert a user successfully', () => {
  return request(app).post(MAIN_ROUTE)
    .send({
      name: 'User',
      last_name: 'Simple',
      mail: `${Date.now()}@mail.com`,
      cpf: genCpf(),
      dt_birth: new Date(),
      phone: '12345678910',
      admin: false,
      passwd: '123456'

    }).set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('User');
      expect(user.admin).toBe(true);
      expect(res.body).not.toHaveProperty('passwd');
    });
});

describe('When trying to insert an invalid user', () => {

  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .send(
        {
          name: 'User',
          last_name: 'Simple',
          mail: `${Date.now()}@mail.com`,
          cpf: genCpf(),
          dt_birth: new Date(),
          phone: '12345678910',
          admin: false,
          passwd: '123456',
          ...newData
        },
      ).set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Should not insert user without name', () =>
    testTemplate({ name: null }, 'Name is a required attribute'));
  test('Should not insert user without email', () =>
    testTemplate({ mail: null }, 'Email is a required attribute'));
  test('Should not insert user without cpf', () =>
    testTemplate({ cpf: null }, 'CPF is a required attribute'));
  test('Should not insert user without admin', () =>
    testTemplate({ admin: null }, 'Admin is a required attribute'));
  test('Should not insert user without password', () =>
    testTemplate({ passwd: null }, 'Password is a required attribute'));
  test('Should not insert email already existing', () =>
    testTemplate({ mail: genMail }, 'Already exists a user with that email'));


});

test('Should store one encrypted password ', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({
      name: 'User',
      last_name: 'Simple',
      mail: `${Date.now()}@mail.com`,
      cpf: genCpf(),
      dt_birth: new Date(),
      phone: '12345678910',
      admin: false,
      passwd: '123456'
    }).set('authorization', `bearer ${user.token}`)

  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe('123456');
});

test('Only administrator user must register a new user', () => {

  return request(app).post(MAIN_ROUTE)
    .send({
      name: 'User',
      last_name: 'Simple',
      mail: `${Date.now()}@mail.com`,
      cpf: genCpf(),
      dt_birth: new Date(),
      phone: '12345678910',
      admin: false,
      passwd: '123456'
    }).set('authorization', `bearer ${authUser.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(authUser.admin).toBe(false);
      expect(res.body.error).toBe('User is not an administrator');
    });
});

test('Only administrator can view users', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${authUser.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User is not an administrator');
    });
});



