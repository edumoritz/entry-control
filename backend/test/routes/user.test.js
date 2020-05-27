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
function genLicense() {
    return `${Date.now()}`;
}

function genMail() {
    return `${Date.now()}@mail.com`;
}

test('Should insert a user successfully', () => {
    return request(app).post('/users')
        .send({ 
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: genMail(),
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            license: genLicense(),
            passwd: '123456'

        })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Asteroide');
        });
});

test('Should list all users', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
});

test('Should not insert user without name', () => {
    return request(app).post('/users')
        .send({ 
            last_name: 'Silverio',
            mail: genMail(),
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            license: genLicense(),
            passwd: '123456'
        })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Name is a required attribute');
        });
});


