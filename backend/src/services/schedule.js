const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (user_id) => {
    return app.db('schedules').where(user_id);
  };

  const findOne = (filter = {}) => {
    const findSchedule = app.db('schedules').where(filter).first();

    return findSchedule;
  };

  const save = async (schedules) => {
    if (!schedules.dt_reservation) throw new ValidationError('Scheduling date is a required attribute');

    const checkOut = await findOne({ user_id: schedules.user_id, check_out: null })
    if (checkOut) throw new ValidationError('Should check_out the old schedule');

    return app.db('schedules').insert(schedules, ['id', 'dt_reservation', 'check_in', 'check_out', 'user_id']);
  };

  const update = async (id, schedule, idDecode = 0) => {
    if (idDecode > 0) {
      const isAdmin = await app.db('users').where({ id: idDecode }).first();
      if (!isAdmin.admin) throw new ValidationError('User is not an administrator');
    }

    return app.db('schedules').where({ id }).update(schedule, '*');
  }

  const remove = (id) => {
    const removeSchedule = app.db('schedules')
      .where({ id })
      .del()

    if (!removeSchedule) throw new ValidationError('This schedule was not found.');
    return removeSchedule
  }

  return { findAll, save, findOne, update, remove };
}

