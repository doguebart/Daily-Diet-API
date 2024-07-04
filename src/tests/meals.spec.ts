import { describe, beforeAll, beforeEach, afterAll, it, expect } from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";
import { app } from "../app";

describe("Meals routes", () => {
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

  it("Should be able to a user create a new meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users/")
      .send({
        name: "John Doe",
        email: "johndow@example.com",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals/")
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);
  });

  it("Should be able to a user list all he's meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users/")
      .send({
        name: "John Doe",
        email: "johndow@example.com",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals/")
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    await request(app.server)
      .post("/meals/")
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description 2",
        description: "Test Meal Description 2",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const userMeals = await request(app.server)
      .get("/meals/")
      .set("Cookie", cookies!)
      .expect(200);

    expect(userMeals.body).toHaveLength(2);
  });

  it("Should be able to a user list one meal by id", async () => {
    const createUserResponse = await request(app.server).post("/users/").send({
      name: "John Doe",
      email: "johndoe@example.com",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals/")
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const mealsResponse = await request(app.server)
      .get("/meals/")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = mealsResponse.body[0].id;

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .expect(200);

    expect(mealResponse.body).toEqual(
      expect.objectContaining({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: expect.any(Number),
        date: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        id: expect.any(String),
        user_id: expect.any(String),
      })
    );
  });

  it("Should be able to a user edit one meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users/")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals/")
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const meals = await request(app.server)
      .get("/meals/")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = meals.body[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .send({
        name: "Test Meal Description UPDATED",
        description: "Test Meal Description UPDATED",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204);
  });

  it("Should be able to a user delete one meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users/")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals/")
      .send({
        name: "Test Meal Description",
        description: "Test Meal Description",
        isOnDiet: false,
        date: new Date(),
      })
      .set("Cookie", cookies!)
      .expect(201);

    const meals = await request(app.server)
      .get("/meals/")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = meals.body[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .expect(204);
  });
});
