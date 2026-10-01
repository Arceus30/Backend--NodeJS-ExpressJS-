/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("posts", (table) => {
        table.increments("id").primary();
        table.string("title", 255).notNullable();
        table.string("content");
        table.timestamps(true, true);
        table.integer("user_id").notNullable().unsigned();
        table.foreign("user_id").references("id").inTable("users");
    });

    const posts = [
        ["Alice's First Post", "Hello from Alice!", 1],
        ["Learning MySQL", "Alice is learning MySQL with Node.js.", 1],
        ["Node.js Database", "Bob is connecting Node.js to MySQL.", 2],
    ];
    await knex("posts").insert(
        posts.map(([title, content, user_id]) => ({ title, content, user_id })),
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("posts");
};
