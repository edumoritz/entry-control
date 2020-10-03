const ValidationError = require('../errors/ValidationError');
const isBefore = require('date-fns/isBefore');

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

    if (isBefore(new Date(schedules.dt_reservation), new Date())) {
      throw new ValidationError('The reservation must be at a future date.');
    }

    return app.db('schedules').insert(schedules, ['id', 'dt_reservation', 'check_in', 'check_out', 'user_id']);
  };

  const update = async (id, schedule, idDecode = 0) => {
    if (idDecode > 0) {
      const isAdmin = await app.db('users').where({ id: idDecode }).first();
      if (!isAdmin.admin) throw new ValidationError('User is not an administrator');
    }

    const { check_in, check_out } = schedule;

    const findSchedule = await app.db('schedules').where({ id }).first();

    if (!findSchedule) {
      throw new ValidationError('Reservation id not found.');
    }

    if (findSchedule.check_out) {
      throw new ValidationError('This reservation is finalized.');
    }


    if (check_in && isBefore(new Date(check_in), findSchedule.dt_reservation)) {
      throw new ValidationError('The check-in date must not be less than the reservation date.');
    }

    if (check_out && !findSchedule.check_in) {
      throw new ValidationError('You must check in before.');
    }

    if (check_out && isBefore(new Date(check_out), findSchedule.check_in)) {
      throw new ValidationError('The check-out date must not be less than the check-in.');
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

