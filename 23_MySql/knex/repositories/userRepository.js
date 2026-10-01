const db = require("../db_knex");

async function createUser(name, email, age) {
    const [id] = await db("users").insert({
        name,
        email,
        age,
    });
    return { insertId: id };
}

async function getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const users = await db("users")
        .select("id", "name", "email", "age", "status", "created_at")
        .orderBy("id")
        .limit(limit)
        .offset(offset);
    return { users };
}

async function getUserCount() {
    const [{ count }] = await db("users").count("* as count");
    return count;
}

async function getUserById(id) {
    const user = await db("users")
        .select("id", "name", "email", "age", "status", "created_at")
        .where("id", id)
        .first();
    return user ?? null;
}

async function getUserByEmail(email) {
    const user = await db("users")
        .select("id", "name", "email", "age", "status", "created_at")
        .where("email", email)
        .first();
    return user ?? null;
}

async function searchUsers({
    search,
    status,
    minAge,
    maxAge,
    page = 1,
    limit = 10,
}) {
    const query = db("users").select(
        "id",
        "name",
        "email",
        "age",
        "status",
        "created_at",
    );

    if (search) {
        query.where(function () {
            this.where("name", "like", `%${search}%`).orWhere(
                "email",
                "like",
                `%${search}%`,
            );
        });
    }

    if (status) {
        query.where("status", status);
    }

    if (minAge !== undefined) {
        query.where("age", ">=", minAge);
    }

    if (maxAge !== undefined) {
        query.where("age", "<=", maxAge);
    }
    const offset = (page - 1) * limit;

    const users = await query
        .clone() // creates a copy of an existing query builder, so you can modify the copy without changing the original query.
        .orderBy("id")
        .limit(limit)
        .offset(offset);

    const [{ count }] = await query
        .clearSelect()
        .clearOrder()
        .count("* as count");

    return {
        users,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit),
        },
    };
}

async function updateUser(id, name, email, age, status) {
    const updates = {};
    if (name) {
        updates["name"] = name;
    }
    if (email) {
        updates["email"] = email;
    }
    if (age) {
        updates["age"] = age;
    }
    if (status) {
        updates["status"] = status;
    }
    const affectedRows = await db("users").where("id", id).update(updates);
    return {
        affectedRows,
    };
}

async function deleteUser(id) {
    const affectedRows = await db("users").where("id", id).del();
    return {
        affectedRows,
    };
}

async function handleTransaction({ name, email, age, title, content }) {
    // If the callback throws an error: rollback
    // If it finishes successfully: commit
    await db.transaction(async (trx) => {
        const [userId] = await trx("users").insert({ name, email, age });
        await trx("posts").insert({ title, content, user_id: userId });
    });
}

module.exports = {
    createUser,
    getUsers,
    getUserCount,
    searchUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    handleTransaction,
};
