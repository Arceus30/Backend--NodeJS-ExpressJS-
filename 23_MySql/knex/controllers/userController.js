const {
    registerUser,
    findAllUsers,
    findUserById,
    updateUserDetails,
    removeUser,
    searchUsers: searchUsersRepository,
    quickTransaction,
} = require("../services/userServices");

async function createUser(req, res) {
    try {
        const { name, email, age } = req.body;
        const result = await registerUser(name, email, age);
        res.status(201).json({
            message: "User created successfully",
            userId: result.insertId,
        });
    } catch (error) {
        if (error.message === "Email already exists") {
            return res.status(409).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to create user",
        });
    }
}

async function getUsers(req, res) {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const users = await findAllUsers(page, limit);
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
}

async function getUser(req, res) {
    try {
        const id = Number(req.params.id);
        const user = await findUserById(id);
        res.status(200).json(user);
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
}

async function searchUsers(req, res) {
    try {
        const { search, status, minAge, maxAge, page, limit } = req.query;
        const result = await searchUsersRepository({
            search,
            status,
            minAge: minAge !== undefined ? Number(minAge) : undefined,
            maxAge: maxAge !== undefined ? Number(maxAge) : undefined,
            page: Math.max(Number(page) || 1, 1),
            limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
        });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to search users",
        });
    }
}

async function updateUser(req, res) {
    try {
        const id = Number(req.params.id);
        const { name, email, age, status } = req.body;
        const result = await updateUserDetails(id, name, email, age, status);
        res.status(200).json({
            message: "User updated successfully",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to update user",
        });
    }
}

async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id);
        const result = await removeUser(id);
        res.status(200).json({
            message: "User deleted successfully",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to delete user",
        });
    }
}

async function transaction(req, res) {
    try {
        const { name, email, age, title, content } = req.body;
        const result = await quickTransaction({
            name,
            email,
            age,
            title,
            content,
        });
        res.status(200).json({
            message: result.message,
        });
    } catch (err) {
        if (err.message === "Transaction Failed") {
            return res.status(400).json({
                message: err.message,
            });
        }
        console.error(err);
        res.status(500).json({
            message: "Failed to transact",
        });
    }
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    transaction,
};
