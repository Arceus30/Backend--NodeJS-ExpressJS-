const { pool, poolEnd } = require("../db/config");
const fs = require("fs/promises");
const path = require("path");

const migrationsDirectory = path.join(__dirname, "../migration");

const createMigrationTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await pool.execute(sql);
};

const executedMigrations = async () => {
    const [executedRows] = await pool.execute(`
    SELECT name
    FROM migrations
    ORDER BY id
`);
    return executedRows;
};

createMigrationTable()
    .then(async () => {
        const files = await fs.readdir(migrationsDirectory);
        const migrationFiles = files
            .filter((file) => file.endsWith(".js"))
            .sort();
        console.log(migrationFiles);
        return migrationFiles;
    })
    .then(async (migrationFiles) => {
        let executedRows = await executedMigrations();
        executedRows = new Set(executedRows.map((row) => row.name));
        console.log("Migrations Executed: ", executedRows);
        return { migrationFiles, executedRows };
    })
    .then(async ({ migrationFiles, executedRows: executedMigrations }) => {
        for (const file of migrationFiles) {
            const migrationName = path.basename(file, ".js");

            if (executedMigrations.has(migrationName)) {
                console.log(`Skipping ${migrationName}`);
                continue;
            }
            console.log(`Running ${migrationName}`);

            const migration = require(path.join(migrationsDirectory, file));
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();
                await migration.up(connection);
                await connection.execute(
                    `INSERT INTO migrations (name) VALUES (?)`,
                    [migrationName],
                );
                await connection.commit();
                console.log(`Completed ${migrationName}`);
            } catch (error) {
                await connection.rollback();
                console.error(`Migration failed: ${migrationName}`);
                throw error;
            } finally {
                connection.release();
            }
        }
    })
    .then(async () => {
        await poolEnd(pool);
    });
