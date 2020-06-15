
exports.up = (knex) => {
  return knex.schema.createTable('schedules', (t) => {
    t.increments('id').primary();
    t.datetime('dt_reservation').notNull();
    t.datetime('check_in');
    t.datetime('check_out');
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNull();
  })
};

exports.down = (knex) => {
  return knex.schema.dropTable('schedules');
};
