const { pool, poolEnd } = require("./db/config.js");
const path = require("path");

const migrationsDirectory = path.join(__dirname, "../migrations");

const latestMigration = async () => {
    const [rows] = await pool.execute(
        `SELECT id, name FROM migrations ORDER BY id DESC LIMIT 1`,
    );
    return rows;
};

latestMigration()
    .then(async (rows) => {
        if (rows.length === 0) {
            console.log("No migrations to rollback");
            await poolEnd();
            process.exit(0);
        }
        const latestMigration = rows[0];
        console.log(`Rolling back ${latestMigration.name}`);

        const migrationPath = path.join(
            migrationsDirectory,
            `${latestMigration.name}.js`,
        );
        const migration = require(migrationPath);
        return migration;
    })
    .then(async (migration) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await migration.down(connection);
            await connection.execute(`DELETE FROM migrations WHERE id = ?`, [
                latestMigration.id,
            ]);
            await connection.commit();
            console.log(`Rolled back ${latestMigration.name}`);
        } catch (error) {
            await connection.rollback();
            console.error(`Rollback failed: ${latestMigration.name}`);
            console.error(error);
            process.exitCode = 1;
        } finally {
            connection.release();
            await pool.end();
        }
    });
