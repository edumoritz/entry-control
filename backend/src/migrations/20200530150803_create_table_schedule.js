
exports.up = (knex) => {
  return knex.schema.createTable('schedules', (t) => {
      t.increments('id').primary();
      t.date('dt_reservation').notNull();
      t.date('check_in');
      t.date('check_out');
      t.integer('user_id')
        .references('id')
        .inTable('users')
        .notNull();
  })
};

exports.down = (knex) => {
  return knex.schema.dropTable('schedules');
};
