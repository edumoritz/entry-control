const request = require('supertest');
const jwt = require('jwt-simple');

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

let user;

beforeAll(async () => {
    const res = await app.services.user.save({ 
        name: 'Asteroide', 
        last_name: 'Silverio',
        mail: genMail,
        cpf: genCpf(),
        dt_birth: new Date(),
        phone: '12345678910',
        license: genLicense(),
        passwd: '123456'
    });
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!');
})

test('Should list all users', () => {
    return request(app).get('/users')
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
});

test('Should insert a user successfully', () => {
    return request(app).post('/users')
        .send({ 
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: `${Date.now()}@mail.com`,
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            license: genLicense(),
            passwd: '123456'

        }).set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Asteroide');
            expect(res.body).not.toHaveProperty('passwd');
            expect(res.body).not.toHaveProperty('license');
        });
});

describe('When trying to insert an invalid user', () => {

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
    test('Should not insert user without license', () => 
        testTemplate({license: null}, 'License is a required attribute'));
    test('Should not insert user without password', () => 
        testTemplate({passwd: null}, 'Password is a required attribute'));
    test('Should not insert email already existing', () => 
        testTemplate({mail: genMail}, 'Already exists a user with that email'));

});

test('Must store one encrypted password ', async () => {
    const res = await request(app).post('/users')
        .send({ 
            name: 'Asteroide', 
            last_name: 'Silverio',
            mail: `${Date.now()}@mail.com`,
            cpf: genCpf(),
            dt_birth: new Date(),
            phone: '12345678910',
            license: genLicense(),
            passwd: '123456'
        }).set('authorization', `bearer ${user.token}`)

        expect(res.status).toBe(201);

        const { id } = res.body;
        const userDB = await app.services.user.findOne({ id });
        expect(userDB.passwd).not.toBeUndefined();
        expect(userDB.passwd).not.toBe('123456');
});



