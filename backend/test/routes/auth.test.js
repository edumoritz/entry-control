const request = require('supertest');
const app = require('../../src/app');

function genCpf() {
    const part1 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
    const part2 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
    const part3 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
    const dig1 = ("" + Math.floor(Math.random() * 9)).padStart(1, '0');
    const dig2 = ("" + Math.floor(Math.random() * 9)).padStart(1, '0');

    return `${part1}.${part2}.${part3}-${dig1}${dig2}`; 
}
const genMail = `${Date.now()}@mail.com`;

test('Must create a user by way of signup', () => {
    return request(app).post('/auth/signup')
        .send({
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: `${Date.now()}@mail.com`,
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            license: `${Date.now()}`,
            passwd: '123456'
        }).then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Asteroide');
            expect(res.body).toHaveProperty('mail');
            expect(res.body).toHaveProperty('cpf');
            expect(res.body).not.toHaveProperty('license');
            expect(res.body).not.toHaveProperty('passwd');
        })
});


test('Must store receive a token when logging', () => {
    return app.services.user.save({
        name: 'Asteroide', 
        last_name: 'Silverio',
        mail: genMail,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        license: `${Date.now()}`,
        passwd: '123456'
    }).then(() => request(app).post('/auth/signin')
        .send({mail: genMail, passwd: '123456'}))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
});

test('Must not authenticate user with invalid password', () => {
    return app.services.user.save({
        name: 'Asteroide', 
        last_name: 'Silverio',
        mail: `${Date.now()}@mail.com`,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        license: `${Date.now()}`,
        passwd: '123456'
    }).then(() => request(app).post('/auth/signin')
        .send({mail: genMail, passwd: '654321'}))
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid username or password');
        });
});

test('Must not authenticate user with invalid user', () => {
    return request(app).post('/auth/signin')
        .send({mail: 'notExist@mail.com', passwd: '654321'})
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid username or password');
        });
});

test('Must not access a protected route without a token', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(401);
        });
});