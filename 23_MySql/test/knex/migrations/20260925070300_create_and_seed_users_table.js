/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("email", 255).notNullable().unique();
        table.integer("age");
        table.string("status", 20).defaultTo("active");
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
    return knex.schema.dropTable("users");
};
