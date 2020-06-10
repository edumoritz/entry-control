const request = require('supertest');
const jwt = require('jwt-simple');
const {genCpf} = require('../utils');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';
const genMail = `${Date.now()}@mail.com`;
let user;

beforeAll(async () => {
    const res = await app.services.user.save({ 
        name: 'Asteroide', 
        last_name: 'Silverio',
        mail: genMail,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        admin: false,
        passwd: '123456'
    });
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!');
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
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: `${Date.now()}@mail.com`,
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            admin: false,
            passwd: '123456'

        }).set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Asteroide');
            expect(res.body).not.toHaveProperty('passwd');
            // expect(res.body).not.toHaveProperty('admin');
        });
});

describe('When trying to insert an invalid user', () => {

    const testTemplate = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
            .send(
                {
                    name: 'Asteroide', 
                    last_name: 'Silverio',
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
        testTemplate({name: null}, 'Name is a required attribute'));
    test('Should not insert user without email', () => 
        testTemplate({mail: null}, 'Email is a required attribute'));
    test('Should not insert user without cpf', () => 
        testTemplate({cpf: null}, 'CPF is a required attribute'));
    test('Should not insert user without admin', () => 
        testTemplate({admin: null}, 'Admin is a required attribute'));
    test('Should not insert user without password', () => 
        testTemplate({passwd: null}, 'Password is a required attribute'));
    test('Should not insert email already existing', () => 
        testTemplate({mail: genMail}, 'Already exists a user with that email'));

});

test('Should store one encrypted password ', async () => {
    const res = await request(app).post(MAIN_ROUTE)
        .send({ 
            name: 'Asteroide', 
            last_name: 'Silverio',
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

test.skip('Somente admin deve cadastrar novo usuário', () => {});
test.skip('Somente admin deve alterar usuário', () => {});
test.skip('Somente admin deve remover usuário', () => {});



