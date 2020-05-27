
exports.up = (knex) => {
    return knex.schema.createTable('users', (t) => {
        t.increments('id').primary();
        t.string('name', 50).notNull();
        t.string('last_name', 50);
        t.string('mail', 100).notNull().unique();
        t.string('cpf', 15).notNull().unique();
        t.date('dt_birth');
        t.string('phone', 15);
        t.string('license', 30).notNull().unique();
        t.string('passwd', 50).notNull();
    })
};

exports.down = (knex) => {
  return knex.schema.dropTable('users');
};
