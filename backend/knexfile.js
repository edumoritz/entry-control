const { connection } = require('./.env');
const path = require('path');

module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection,
        migrations: {
          directory: path.resolve(__dirname, 'src', 'database', 'migrations')
        },
        seeds: {
          directory: path.resolve(__dirname, 'src', 'database', 'seeds')
        }
    }
};