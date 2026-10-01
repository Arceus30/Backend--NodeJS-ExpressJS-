import { describe, it, expect } from "vitest";

// describe(): Groups related tests. describe = test group
describe("User Service", () => {
    // it(): Defines one specific behavior. it = one test case
    // it() and test() are essentially interchangeable in Vitest.
    // test("should create a test", () => {})

    it("should create a test", () => {
        const result = 2 + 2;
        // expect(): Defines what you expect to happen.
        // actual result === expected result
        expect(result).toBe(4); // Equality
        // expect(user).toEqual({ name: "Alice", age: 24 }); // Objects
        // expect(user).toBeTruthy(); // Truthiness
        // expect(user).toBeNull(); // Null
        // expect(users).toHaveLength(2); // Arrays
        // expect(users).toContain(user); // Contains
    });
});
