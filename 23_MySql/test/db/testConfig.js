require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.TEST_DB_NAME,
};

const testPool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10,
});
console.log("The test connection pool was successfully created.");

const poolEnd = async (pool) => {
    if (pool) {
        await pool.end();
        console.log("MySql Connection Ended");
    }
};

module.exports = { testPool, poolEnd };
