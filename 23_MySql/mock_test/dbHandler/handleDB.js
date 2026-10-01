const validateDB = () => {
    // Get the database name from the environment variables.
    const dbName = process.env.DB_NAME;
    // Validate the database name before using it in the SQL query.
    if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error("Invalid database name");
    }
    return dbName;
};

const createDB = async (connection) => {
    const dbName = validateDB();
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``); // This sends SQL command to MySQL.
    console.log(`Database ${dbName} Created successfully`);
    return dbName;
};

const useDB = async (connection, dbName) => {
    await connection.query(`USE \`${dbName}\``);
    console.log(`Connected to Database ${dbName}`);
};

module.exports = { createDB, useDB };
