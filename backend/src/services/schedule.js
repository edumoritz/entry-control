const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = () => {
        return app.db('schedules').select(
            ['id', 'dt_reservation', 'check_in', 'check_out', 'user_id']
        );
    };

    const findOne = (filter = {}) => {
        return app.db('schedules').where(filter).first();
    };
    
    const save = async (schedules) => {
        if(!schedules.dt_reservation) throw new ValidationError('Scheduling date is a required attribute');

        return app.db('schedules').insert(schedules, ['id', 'dt_reservation', 'check_in', 'check_out', 'user_id']);
    };

    const update = (id, schedule) => {
        return app.db('schedules').where({id}).update(schedule, '*');
    }

    const remove = (id) => {
        return app.db('schedules')
            .where({ id })
            .del()
    }

    return { findAll, save, findOne, update, remove };
}