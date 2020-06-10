const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select(
            ['id', 'name', 'last_name', 'mail', 'cpf', 'dt_birth', 'phone', 'admin']
        );
    };

    const findOne = (filter = {}) => {
        return app.db('users').where(filter).first();
    };

    const getPasswdHash = (passwd) => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(passwd, salt);
    };
    
    const save = async (user) => {
        if(!user.name) throw new ValidationError('Name is a required attribute');
        if(!user.mail) throw new ValidationError('Email is a required attribute');
        if(!user.cpf) throw new ValidationError('CPF is a required attribute');
        if(!user.passwd) throw new ValidationError('Password is a required attribute');
        if(user.admin === null ||
          user.admin === "undefined") throw new ValidationError('Admin is a required attribute');

        const userDb = await findOne({mail: user.mail});
        if(userDb) throw new ValidationError('Already exists a user with that email');

        user.passwd = getPasswdHash(user.passwd);

        return app.db('users').insert(user, ['id', 'name', 'last_name', 'mail', 'cpf', 'dt_birth', 'phone', 'admin']);
    };

    return { findAll, save, findOne };
}