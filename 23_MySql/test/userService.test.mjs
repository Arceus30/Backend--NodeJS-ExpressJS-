import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getUserById,
    getUserByEmail,
    createUser,
} from "../repositories/userRepository.mjs";
import { findUserById, registerUser } from "../services/userServices.mjs";

// Whenever the service imports this repository module, don't give it the real repository. Give it these fake functions instead.
// vi.mock(): Replaces an imported module Useful when testing a module that has dependencies:
vi.mock("../repositories/userRepository.mjs", () => ({
    // vi.fn() creates a fake function Useful when you manually need a mock function:
    // const mockGetUser = vi.fn();
    getUserById: vi.fn(),
    createUser: vi.fn(),
    getUserByEmail: vi.fn(),
    getUsers: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserCount: vi.fn(),
    searchUsers: vi.fn(),
}));

describe("User Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return a user when user exists", async () => {
        // expected user
        const mockUser = {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
            age: 24,
            status: "active",
        };
        getUserById.mockResolvedValue(mockUser);

        // actual user
        const user = await findUserById(1);

        expect(user).toEqual(mockUser);
        expect(getUserById).toHaveBeenCalledWith(1);
    });

    it("should throw an error when user does not exist", async () => {
        getUserById.mockResolvedValue(null);
        await expect(findUserById(999)).rejects.toThrow("User not found");
    });

    it("should create a new user", async () => {
        getUserByEmail.mockResolvedValue(null);
        const mockUserId = {
            insertId: 10,
            affectedRows: 1,
        };
        createUser.mockResolvedValue(mockUserId);

        const result = await registerUser("David", "david@example.com", 26);

        expect(result).toEqual(mockUserId);

        expect(getUserByEmail).toHaveBeenCalledWith("david@example.com");
        expect(createUser).toHaveBeenCalledWith(
            "David",
            "david@example.com",
            26,
        );
    });

    it("should reject a duplicate user", async () => {
        const mockUser = {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
        };
        getUserByEmail.mockResolvedValue(mockUser);

        await expect(
            registerUser("Alice", "alice@example.com", 24),
        ).rejects.toThrow("Email already exists");

        expect(getUserByEmail).toHaveBeenCalled("david@example.com");
        expect(createUser).not.toHaveBeenCalled(); // tests: mail exists  -->  throw error  -->  STOP
    });
});
