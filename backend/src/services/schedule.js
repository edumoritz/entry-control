const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (user_id) => {
    return app.db('schedules').where(user_id);
  };

  const findOne = (filter = {}) => {
    return app.db('schedules').where(filter).first();
  };

  const save = async (schedules) => {
    if (!schedules.dt_reservation) throw new ValidationError('Scheduling date is a required attribute');

    const checkOut = await findOne({ user_id: schedules.user_id, check_out: null })
    if (checkOut) throw new ValidationError('Should check_out the old schedule');

    return app.db('schedules').insert(schedules, ['id', 'dt_reservation', 'check_in', 'check_out', 'user_id']);
  };

  const update = (id, schedule, isAdmin) => {
    if (isAdmin === false) throw new ValidationError('User is not an administrator');
    return app.db('schedules').where({ id }).update(schedule, '*');
  }

  const remove = (id) => {
    return app.db('schedules')
      .where({ id })
      .del()
  }

  return { findAll, save, findOne, update, remove };
}

