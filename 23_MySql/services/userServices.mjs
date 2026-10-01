import {
    createUser,
    getUsers,
    getUserCount,
    getUserById,
    getUserByEmail,
    searchUsers as searchUsersRepository,
    updateUser,
    deleteUser,
} from "../repositories/userRepository.mjs";

export async function registerUser(name, email, age) {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already exists");
    }
    return createUser(name, email, age);
}

export async function findAllUsers(page, limit) {
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

export async function findUserById(id) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

export async function searchUsers(filters) {
    return searchUsersRepository(filters);
}

export async function updateUserDetails(id, name, email, age, status) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return updateUser(id, name, email, age, status);
}

export async function removeUser(id) {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    return deleteUser(id);
}
