const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const { genCpf } = require('../utils');
const { secret } = require('../../.env');

const MAIN_ROUTE = '/v1/schedules';
let user;
let user2;
let user3;
const reservation = new Date();

beforeAll(async () => {
  
  const res = await app.services.user.save({
    name: 'User Admin',
    last_name: 'Account',
    mail: `${Date.now()}@mail.com`,
    cpf: genCpf(),
    dt_birth: new Date(),
    phone: '12345678910',
    admin: true,
    passwd: '$2a$10$Xa9J4TaR2v9E27P/4BpMzuiKJomJuXh58.LhKJdQLW43pKyGXEo6.'
  });
  const res2 = await app.services.user.save({
    name: 'User Admin 2',
    last_name: 'Account 2',
    mail: `${Date.now()}2@mail.com`,
    cpf: genCpf(),
    dt_birth: new Date(),
    phone: '12345678910',
    admin: true,
    passwd: '$2a$10$xoQ8gsyhZ45xWASbT6PhH.6CHmMj8acpnR/roIiYGZB.bTx3YyUkG'
  });
  const res3 = await app.services.user.save({
    name: 'User No Admin',
    last_name: 'Account 3',
    mail: `${Date.now()}3@mail.com`,
    cpf: genCpf(),
    dt_birth: new Date(),
    phone: '12345678910',
    admin: false,
    passwd: '$2a$10$WREIWEtqxidJI7RvFzLlbu.KenH25aK87QDomtqfZCPrsjSlVyj/6'
  });

  user = { ...res[0] };
  user.token = jwt.encode(user, secret.key);

  user2 = { ...res2[0] };

  user3 = { ...res3[0] };
  user3.token = jwt.encode(user3, secret.key);

});

test('Should list only the user schedules', () => {
  var baseTime = new Date(2013, 9, 23);

  return app.db('schedules').insert([
    { dt_reservation: baseTime, user_id: user.id }, //received
    { dt_reservation: new Date(), user_id: user2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(new Date(res.body[0].dt_reservation).getTime()).toEqual(baseTime.getTime()); //expect
    }));

});

test('Should not enter a schedule for the same user without having performed the check_out of the previous one', async () => {
  await app.db('schedules').del();

  var baseTime = new Date(2015, 1, 15);
  return app.db('schedules').insert([
    { dt_reservation: baseTime, user_id: user.id },
  ]).then((sh) => request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ dt_reservation: new Date(), user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Should check_out the old schedule');
    }));
});

test('Should insert a scheduling successfully', async () => {
  await app.db('schedules').del();
  return request(app).post(MAIN_ROUTE)
    .send({ dt_reservation: reservation })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(user.admin).toBe(true);
    })
});


test('Should not insert a scheduling without scheduling date', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ check_in: new Date(), check_out: new Date() })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Scheduling date is a required attribute');
    })
});

test('Should return a scheduling by id', async () => {
  await app.db('schedules').del();
  return app.db('schedules')
    .insert({ dt_reservation: new Date('10-10-2020'), user_id: user.id }, ['id'])
    .then(sh => request(app).get(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Should not return another user*s schedule', () => {
  return app.db('schedules')
    .insert({ dt_reservation: new Date(), user_id: user2.id }, ['id'])
    .then(sh => request(app).get(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to the user');
    });
});

test('Should change a scheduling', () => {
  return app.db('schedules')
    .insert({
      dt_reservation: reservation,
      user_id: user.id
    }, ['id'])
    .then((sh) => request(app).put(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ check_in: new Date(), check_out: new Date() }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(user.admin).toBe(true);
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Must not change another user*s schedule', async () => {
  await app.db('schedules').del();
  return app.db('schedules')
    .insert({ dt_reservation: new Date(), user_id: user2.id }, ['id'])
    .then(sh => request(app).put(`${MAIN_ROUTE}/${sh[0].id}`)
      .send({ dt_reservation: new Date() })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to the user');
    });
});

test('Should delete a scheduling', () => {
  return app.db('schedules')
    .insert({
      dt_reservation: reservation,
      user_id: user.id
    }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
      expect(user.admin).toBe(true);
    });
});

test('Must not delete another user*s schedule', async () => {
  await app.db('schedules').del();
  return app.db('schedules')
    .insert({ dt_reservation: new Date(), user_id: user2.id }, ['id'])
    .then(sh => request(app).delete(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to the user');
    });
});

test('Only admin should perform user check_in', async () => {
  await app.db('schedules').del(); 

  return app.db('schedules')
    .insert({
      dt_reservation: reservation,
      user_id: user3.id
    }, ['id'])
    .then((sh) => request(app).put(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user3.token}`)
      .send({ check_in: new Date() }))
    .then((res) => {      
      expect(res.status).toBe(400);
      expect(user3.admin).toBe(false);
      expect(res.body.error).toBe('User is not an administrator');
    });
});

test('Only admin should perform user check_out', async () => { 
  await app.db('schedules').del(); 

  return app.db('schedules')
    .insert({
      dt_reservation: reservation,
      user_id: user3.id
    }, ['id'])
    .then((sh) => request(app).put(`${MAIN_ROUTE}/${sh[0].id}`)
      .set('authorization', `bearer ${user3.token}`)
      .send({ check_out: new Date() }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(user3.admin).toBe(false);
      expect(res.body.error).toBe('User is not an administrator');
    });
});
