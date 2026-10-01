/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // creates a users table in the database.

    // knex.schema.createTable(tableName, (table) => {
    //     Define the columns of that table here.
    // });
    // "table" is a Knex TableBuilder object used to configure the columns, constraints, defaults, indexes, etc. for the table.

    // methods:
    // .increments()          --> creates an auto-incrementing integer column, the db automatically generates a new number whenever a new user is inserted, this as an UNSIGNED integer.
    // .primary()             --> defines a primary key, A primary key uniquely identifies each row in the table and cannot contain NULL values.
    // .string(name, maxLen)  -->  creates a string/VARCHAR column, if maxLen is provided then it creates a string with maximum length maxLen
    // .notNullable()         --> prevents NULL values, The database will reject a user record that does not provide a name, unless a default value is configured.
    // .unique()              --> Creates a UNIQUE constraint prevents duplicate values
    // .integer()             --> creates an integer column, creates a regular signed integer.
    // .defaultTo()           --> specifies a default value

    // Knex converts these definitions into the appropriate SQL for the database configured in the project.

    await knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable(); //  maximum length of name is 100
        table.string("email", 255).notNullable().unique();
        table.integer("age"); // It is nullable by default. This means a user can be inserted without providing an age.
        table.string("status", 20).defaultTo("active"); // default value of status is active

        // Creates two timestamp columns:
        // created_at -> stores when the record was created
        // updated_at -> stores when the record was last updated

        // The first argument (true): Adds the timestamp columns with timezone support where supported by the database.
        // The second argument (true): Uses the database's automatic update behavior for updated_at where supported by the database/client.
        table.timestamps(true, true);
    });

    const users = [
        ["Alice", "alice@example.com", 24],
        ["Bob", "bob@example.com", 27],
        ["Charlie", "charlie@example.com", 22],
    ];
    await knex("users").insert(
        users.map(([name, email, age]) => ({ name, email, age })),
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    // Reverses the "up" migration by deleting the "users" table.
    // This is executed when the migration is rolled back.
    // WARNING: Dropping the table also deletes all data stored in it.
    return knex.schema.dropTable("users");
};
