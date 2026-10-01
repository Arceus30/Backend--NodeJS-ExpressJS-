const createPostTable = async (connection) => {
    const createPostsTable = `CREATE TABLE IF NOT EXISTS posts 
    (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
        FOREIGN KEY (user_id)
            REFERENCES users(id)
    )`;
    await connection.query(createPostsTable);
    console.log("Posts table created");
};

const seedPosts = async (connection) => {
    const posts = [
        ["Alice's First Post", "Hello from Alice!", 1],
        ["Learning MySQL", "Alice is learning MySQL with Node.js.", 1],
        ["Node.js Database", "Bob is connecting Node.js to MySQL.", 2],
    ];
    const sql = `INSERT IGNORE INTO posts (title, content, user_id) VALUES (?, ?, ?)`;
    for (const post of posts) {
        const [result] = await connection.execute(sql, post);
        console.log(`Inserted post "${post[0]}" with ID ${result.insertId}`);
    }
};

const getPosts = async (connection) => {
    const sql = `SELECT
        p.id, p.title, p.content,
        u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM posts AS p
    INNER JOIN users AS u
        ON p.user_id = u.id
        `;

    const [rows] = await connection.execute(sql);
    console.log(rows);
};

module.exports = {
    createPostTable,
    seedPosts,
    getPosts,
};
