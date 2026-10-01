const createUserTable = async (connection) => {
    const createUsersTable = `CREATE TABLE IF NOT EXISTS users 
    (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,  /* 100 is the max length of name */
        email VARCHAR(255) NOT NULL UNIQUE,
        age INT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
        /*
        birthDate DATE,
        profileImage LONGBLOB,
        isActive BOOLEAN DEFAULT TRUE,
        metadata JSON, 
        */ 
        /* Mixed: Can contain strings, numbers, objects, arrays, etc.*/
        /*
        salary DECIMAL(30, 10),
        externalId CHAR(36) UNIQUE, 
        */ 
        /* length of externalId is exactly equal to 36 */
        /*
        rating DOUBLE,
        role ENUM('user', 'admin') DEFAULT 'user',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,
        */
        /* updatedAt is automatically updated, MySQL automatically updates the updatedAt time whenever any row is updated */
    )`;
    await connection.query(createUsersTable);
    console.log("Users table created");
};

const seedUsers = async (connection) => {
    const users = [
        ["Alice", "alice@example.com", 24],
        ["Bob", "bob@example.com", 27],
        ["Charlie", "charlie@example.com", 22],
    ];
    const sql = `INSERT IGNORE INTO users (name, email, age) VALUES (?, ?, ?)`;
    for (const user of users) {
        const [result] = await connection.execute(sql, user);
        console.log(`Inserted ${user[0]} with ID ${result.insertId}`);
    }
    console.log("Users inserted successfully");
};

const getUsers = async (connection) => {
    // const sql = `SELECT * FROM users`; // all users all columns
    // const sql = `SELECT name, email FROM users`; // all users specified columns
    const sql = `SELECT * FROM users WHERE id = ?`; // filtered users all columns

    // A SELECT query that finds no rows generally doesn't throw an error.
    const [rows] = await connection.execute(sql, [1]);
    if (rows.length === 0) {
        console.log("User not found");
    }
    for (const user of rows) {
        console.log(user);
    }
};

const updateUser = async (connection) => {
    const userId = 2;
    const newAge = 30;
    const sql = `UPDATE users SET name = ?, age = ?, status = ? WHERE id = ?`;
    const [result] = await connection.execute(sql, [
        "Bobby",
        newAge,
        "active",
        userId,
    ]);
    console.log("Update Affected rows:", result.affectedRows);

    // const sql = `UPDATE users SET age = ? WHERE id = ?`;
    // const [result] = await connection.execute(sql, [newAge, userId]);
    // console.log("Update Affected rows:", result.affectedRows);
};

const deleteUser = async (connection) => {
    const userId = 3;
    // const userId = 1; // Alice has created some posts, so MySQL will normally reject deleting Alice because posts still reference her. This is referential integrity in action.
    const sql = `DELETE FROM users WHERE id = ?`;
    const [result] = await connection.execute(sql, [userId]);
    console.log("Delete Affected rows:", result.affectedRows);
};

module.exports = {
    createUserTable,
    seedUsers,
    getUsers,
    updateUser,
    deleteUser,
};
