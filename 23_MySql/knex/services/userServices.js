const {
    createUser,
    getUsers,
    getUserCount,
    getUserById,
    getUserByEmail,
    searchUsers: searchUsersRepository,
    updateUser,
    deleteUser,
    handleTransaction,
} = require("../repositories/userRepository.js");

async function registerUser(name, email, age) {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already exists");
    }
    return createUser(name, email, age);
}

async function findAllUsers(page, limit) {
    const users = await getUsers(page, limit);
    const total = await getUserCount();
    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function findUserById(id) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

async function searchUsers(filters) {
    return searchUsersRepository(filters);
}

async function updateUserDetails(id, name, email, age, status) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return updateUser(id, name, email, age, status);
}

async function removeUser(id) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return deleteUser(id);
}

async function quickTransaction(details) {
    try {
        await handleTransaction(details);
        return { message: "Transaction committed" };
    } catch (err) {
        throw new Error("Transaction Failed");
    }
}

module.exports = {
    registerUser,
    findUserById,
    findAllUsers,
    updateUserDetails,
    removeUser,
    searchUsers,
    quickTransaction,
};
