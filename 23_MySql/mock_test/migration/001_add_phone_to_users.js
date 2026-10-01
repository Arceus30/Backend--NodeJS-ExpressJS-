async function up(connection) {
    await connection.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(20)`);
}

async function down(connection) {
    await connection.execute(`ALTER TABLE users DROP COLUMN phone`);
}

module.exports = { up, down };
