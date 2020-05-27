const { connection } = require('./.env');

module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection,
        migrations: {
            directory: 'src/migrations',
        },
    },
};