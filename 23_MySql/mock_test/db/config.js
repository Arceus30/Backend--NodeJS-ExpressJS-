const mysql = require("mysql2/promise");

// The configuration is an object: {host, user, password, port [, database]}
// Property     Meaning
// host         Where MySQL is running
// user         MySQL username
// password     MySQL password
// port         MySQL server port, usually 3306
// database    MySQL database to connect to.
//             If the database doesn't exist, the connection will fail.
// No database is specified here because this script creates the database.
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
};

const connect = async () => {
    // Connect Node.JS program to the MySQL server using the configuration above.
    const connection = await mysql.createConnection(dbConfig);
    console.log("Mysql Connection Successfull");
    return connection;
};

const connectPool = async () => {
    // creates a pool of MySQL connections. Instead of creating one database connection and opening/closing it for every query, a pool maintains multiple reusable connections.
    // mysql.createPool() doesn't necessarily mean that a MySQL connection has already been successfully established.
    // It is essentially creating the pool configuration/object. An actual connection may be established when you execute a query or otherwise use the pool.
    const pool = mysql.createPool({
        ...dbConfig,
        connectionLimit: 10, // means the pool can maintain/use up to 10 database connections at a time.
    });
    console.log("The connection pool was successfully created.");
    return pool;
};

const connectionEnd = async (connection) => {
    // Close the MySQL connection when we're finished.
    // This prevents the connection from remaining open unnecessarily.
    if (connection) {
        await connection.end();
        console.log("MySql Connection Ended");
    }
};

module.exports = { connect, connectionEnd, connectPool };
