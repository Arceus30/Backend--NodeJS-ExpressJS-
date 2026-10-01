import { describe, it, expect, afterAll, beforeEach } from "vitest";
import { testPool } from "./db/testConfig.js";
import { createUser, getUserByEmail } from "./repository/userRepository.mjs";

describe("User Repository", () => {
    // Runs once before each test.
    beforeEach(async () => {
        await testPool.execute(`DELETE FROM posts`);
        await testPool.execute(`DELETE FROM users`);
    });

    it("should create and retrieve a user", async () => {
        const result = await createUser(
            "Integration User",
            "integration@example.com",
            30,
        );

        expect(result.affectedRows).toBe(1);

        const user = await getUserByEmail("integration@example.com");
        expect(user).not.toBeNull();
        expect(user.name).toBe("Integration User");
        expect(user.email).toBe("integration@example.com");
        expect(user.age).toBe(30);
    });

    it("should reject duplicate email", async () => {
        await createUser("Alice", "duplicate@test.com", 24);
        
        await expect(
            createUser("Bob", "duplicate@test.com", 30),
        ).rejects.toThrow();
    });

    it("should return null when user does not exist", async () => {
        const user = await getUserByEmail("doesnotexist@test.com");
        expect(user).toBeNull();
    });

    // Runs once after all the tests.
    afterAll(async () => {
        await testPool.end();
    });
});
