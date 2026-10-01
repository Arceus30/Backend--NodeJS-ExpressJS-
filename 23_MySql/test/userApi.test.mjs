// These tests currently use your actual MySQL database.
// For learning, that's okay temporarily, but we don't want our test suite modifying our normal development database.
// We'll fix that in the next step by introducing a test database/environment and proper cleanup.
// Development  -->  node_mysql_server
// Testing  -->  node_mysql_test

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("User API", () => {
    it("should return users", async () => {
        const response = await request(app).get("/users");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("users");
    });
    // it("should create a user", async () => {
    //     const response = await request(app).post("/users").send({
    //         name: "Test User",
    //         email: "testuser@example.com",
    //         age: 25,
    //     });
    //     expect(response.status).toBe(201);
    //     expect(response.body).toHaveProperty("userId");
    // });
    it("should return 404 when user does not exist", async () => {
        const response = await request(app).get("/users/999999");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "User not found",
        });
    });
    // it("should delete a user", async () => {
    //     const response = await request(app).delete("/users/20").send();

    //     expect(response.status).toBe(200);
    // });
});
