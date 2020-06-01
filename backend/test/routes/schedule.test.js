const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const {genCpf, genLicense} = require('../utils');

const MAIN_ROUTE = '/schedules';
let user;
let user2;
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
    const res2 = await app.services.user.save({
        name: 'User 2', 
        last_name: 'Account 2',
        mail: `${Date.now()}2@mail.com`,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        license: genLicense(),
        passwd: '123456'
    })

    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!');

    user2 = { ...res2[0] };
});

test('Should list only the user schedules', () => {
    var baseTime = new Date(2013, 9, 23);

    return app.db('schedules').insert([
        {dt_reservation: baseTime, user_id: user.id}, //received
        {dt_reservation: new Date(), user_id: user2.id},
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
        {dt_reservation: baseTime, user_id: user.id},                 
    ]).then((sh) => request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({dt_reservation: new Date(), user_id: user.id})
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Should check_out the old schedule');
        }));
});

test('Should insert a scheduling successfully', async() => {
    await app.db('schedules').del();
    return request(app).post(MAIN_ROUTE)
        .send({dt_reservation: reservation})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201);
        })
});


test('Should not insert a scheduling without scheduling date', () => {
    return request(app).post(MAIN_ROUTE)
        .send({check_in: new Date(), check_out: new Date()})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Scheduling date is a required attribute');
        })
});

// test('Should return a scheduling by id', () => {
//     return app.db('schedules')
//         .insert({dt_reservation: new Date(), user_id: user.id}, ['id'])    
//         .then((sh) => request(app).get(`${MAIN_ROUTE}/${sh[0].id}`)
//         .set('authorization', `bearer ${user.token}`))
//         .then((res) => {
//             expect(res.status).toBe(200);
//             expect(res.body.user_id).toBe(user.id);
//         });        
// });

test('Should not return another user*s schedule', () => {
    return app.db('schedules')
        .insert({dt_reservation: new Date(), user_id: user2.id}, ['id'])  
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
        .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .send({check_in: new Date(), check_out: new Date()}))        
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.user_id).toBe(user.id);
        }); 
});

test.skip('Não deve alterar um agendamento de outro usuario', () => {
    return app.db('schedules')
        .insert({dt_reservation: new Date(), user_id: user2.id}, ['id'])  
        .then(sh => request(app).put(`${MAIN_ROUTE}/${sh[0].id}`)
            .send({dt_reservation: new Date()})
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
        }); 
});

test.skip('Não deve remover um agendamento de outro usuario', () => {
    return app.db('schedules')
    .insert({dt_reservation: new Date(), user_id: user2.id}, ['id'])  
    .then(sh => request(app).delete(`${MAIN_ROUTE}/${sh[0].id}`)
        .set('authorization', `bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('This resource does not belong to the user');
    });
});

