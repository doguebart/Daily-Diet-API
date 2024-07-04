import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { app } from "../app";
import request from "supertest";
import { execSync } from "node:child_process";

describe("Create User test", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("Should be able to create a new user.", async () => {
    await request(app.server)
      .post("/users/")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
      })
      .expect(201);
  });
});
