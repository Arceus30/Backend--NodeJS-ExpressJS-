import { testPool } from "../db/testConfig";

export async function createUser(name, email, age) {
    const [result] = await testPool.execute(
        `INSERT INTO users (name, email, age) VALUES (?, ?, ?)`,
        [name, email, age],
    );
    return result;
}

export async function getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await testPool.execute(
        `SELECT id, name, email, age, status, created_at FROM users ORDER BY id LIMIT ? OFFSET ?`,
        [limit, offset],
    );
    return rows;
}

export async function getUserCount() {
    const [rows] = await testPool.execute(
        `SELECT COUNT(*) AS total FROM users`,
    );
    return rows[0].total;
}

export async function getUserById(id) {
    const [rows] = await testPool.execute(
        `SELECT id, name, email, age, status, created_at FROM users WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getUserByEmail(email) {
    const [rows] = await testPool.execute(
        `SELECT id, name, email, age, status, created_at FROM users WHERE email = ?`,
        [email],
    );
    return rows[0] ?? null;
}

export async function searchUsers({
    search,
    status,
    minAge,
    maxAge,
    page = 1,
    limit = 10,
}) {
    const conditions = [];
    const values = [];

    if (search) {
        conditions.push(`(name LIKE ? OR email LIKE ?)`);
        values.push(`%${search}%`);
        values.push(`%${search}%`);
    }

    if (status) {
        conditions.push(`status = ?`);
        values.push(status);
    }

    if (minAge !== undefined) {
        conditions.push(`age >= ?`);
        values.push(minAge);
    }

    if (maxAge !== undefined) {
        conditions.push(`age <= ?`);
        values.push(maxAge);
    }
    const offset = (page - 1) * limit;

    let sql = `SELECT id, name, email, age, status, created_at FROM users`;

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY id LIMIT ? OFFSET ? `;
    values.push(limit, offset);

    const [users] = await testPool.execute(sql, values);

    sql = sql.replace(
        "id, name, email, age, status, created_at",
        "COUNT(*) AS total",
    );
    const [rows] = await testPool.execute(sql, values);

    return {
        users,
        pagination: {
            page,
            limit,
            total: Number(rows[0].total),
            totalPages: Math.ceil(Number(rows[0].total) / limit),
        },
    };
}

export async function updateUser(id, name, email, age, status) {
    let sql = `UPDATE users SET `;
    const values = [];
    const updates = [];
    if (name) {
        updates.push(`name = ?`);
        values.push(name);
    }
    if (email) {
        updates.push(`email = ?`);
        values.push(email);
    }
    if (age) {
        updates.push(`age = ?`);
        values.push(age);
    }
    if (status) {
        updates.push(`status = ?`);
        values.push(status);
    }
    sql += `${updates.join(", ")}`;
    sql += ` WHERE id = ?`;
    values.push(id);
    const [result] = await testPool.execute(sql, values);
    return result;
}

export async function deleteUser(id) {
    const [result] = await testPool.execute(`DELETE FROM users WHERE id = ?`, [
        id,
    ]);
    return result;
}
