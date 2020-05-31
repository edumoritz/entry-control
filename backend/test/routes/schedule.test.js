const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const {genCpf, genLicense} = require('../utils');

const MAIN_ROUTE = '/schedules';
let user;
const reservation = new Date();

beforeAll(async () => {
    const res = await app.services.user.save({
        name: 'User', 
        last_name: 'Account',
        mail: `${Date.now()}@mail.com`,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        license: genLicense(),
        passwd: '123456'
    })

    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!');
});

test('Must insert a scheduling successfully', () => {
    return request(app).post(MAIN_ROUTE)
        .send({dt_reservation: reservation, user_id: user.id})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201);
        })
});

test.skip('Não deve inserir mais de um agendamento sem realizar o check_out do anterior', () => {});

test('Must not insert a scheduling without scheduling date', () => {
    return request(app).post(MAIN_ROUTE)
        .send({user_id: user.id})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Scheduling date is a required attribute');
        })
});

test('Must list all scheduling', () => {
    return app.db('schedules')
        .insert({dt_reservation: new Date(), user_id: user.id})        
        .then(() => request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
});

test.skip('Deve listar apenas os agendamentos do usuário', () => {});

test('Must return a scheduling by id', () => {
    return app.db('schedules')
        .insert({dt_reservation: new Date(), user_id: user.id}, ['id'])    
        .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.user_id).toBe(user.id);
        });        
});

test.skip('Não deve retornar um agendamento de outro usuario', () => {});

test('Must change a scheduling', () => {
    return app.db('schedules')
        .insert({
            dt_reservation: reservation,  
            user_id: user.id
        }, ['id'])    
        .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .send({check_in: new Date(), check_out: new Date()}))        
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.user_id).toBe(user.id);
        }); 
});

test.skip('Não deve alterar um agendamento de outro usuario', () => {});

test('Must delete a scheduling', () => {
    return app.db('schedules')
        .insert({
            dt_reservation: reservation,  
            user_id: user.id
        }, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`))        
        .then((res) => {
            expect(res.status).toBe(204);
        }); 
});

test.skip('Não deve remover um agendamento de outro usuario', () => {});

