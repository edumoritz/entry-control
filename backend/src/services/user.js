module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select();
    };
    
    const save = async (user) => {
        if(!user.name) return { error: 'Name is a required attribute' };
        if(!user.mail) return { error: 'Email is a required attribute' };
        if(!user.cpf) return { error: 'CPF is a required attribute' };
        if(!user.license) return { error: 'License is a required attribute' };
        if(!user.passwd) return { error: 'Password is a required attribute' };

        const userDb = await findAll({mail: user.mail});
        if(userDb && userDb.length > 0) return { error: 'Already exists a user with that email' }

        return app.db('users').insert(user, '*');
    };

    return { findAll, save };
}