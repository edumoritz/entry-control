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

const genMail = `${Date.now()}@mail.com`;


test('Should insert a user successfully', () => {
    return request(app).post('/users')
        .send({ 
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: genMail,
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

describe('Ao tentar inserir uma transação inválida', () => {

    const testTemplate = (newData, errorMessage) => {
        return request(app).post('/users')
            .send(
                {
                    name: 'Asteroide', 
                    last_name: 'Silverio',
                    mail: genMail,
                    cpf: genCpf(),
                    dt_birth: new Date(),
                    phone: '12345678910',
                    license: genLicense(),
                    passwd: '123456',
                    ...newData
                },
            ).then((res) => {
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
    test('Should not insert user without license', () => 
        testTemplate({license: null}, 'License is a required attribute'));
    test('Should not insert user without password', () => 
        testTemplate({passwd: null}, 'Password is a required attribute'));
    test('Should not insert email already existing', () => 
        testTemplate({mail: genMail}, 'Already exists a user with that email'));

});



