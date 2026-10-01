/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // .foreign()  -->  defines a foreign key

    await knex.schema.createTable("posts", (table) => {
        table.increments("id").primary();
        table.string("title", 255).notNullable();
        table.string("content");
        table.timestamps(true, true);

        // Creates a "user_id" column. This column is intended to store a value that refers to a row in another table.
        // .integer("post_id")  -->  Creates an integer column that is intended to store the ID of a related record.
        // .notNullable()  -->  Requires every user record to have a post_id value.
        table.integer("user_id").notNullable().unsigned();

        // Creates a foreign-key constraint for "user_id". A foreign key creates a relationship between two tables.
        // .foreign("post_id")  -->  Tells the database that "post_id" is a foreign-key column.
        // .references("id")  -->  Specifies that post_id must reference an "id" value.
        // .inTable("users")  -->  Specifies that the referenced "id" belongs to the "users" table.
        // If a user.id does not exist, the database will reject any post record containing that user_id.
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
    // Reverses the "up" migration by deleting the "users" table.
    // This is executed when the migration is rolled back.
    // WARNING: Dropping the table also deletes all data stored in it.
    return knex.schema.dropTable("posts");
};
