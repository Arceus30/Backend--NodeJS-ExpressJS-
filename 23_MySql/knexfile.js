require("dotenv").config();
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: "./knex/migrations",
            tableName: "knex_migrations",
        },
    },
    test: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
            database: process.env.TEST_DB_NAME,
        },
        migrations: {
            directory: "./test/knex/migrations",
            tableName: "knex_test_migrations",
        },
    },
};
