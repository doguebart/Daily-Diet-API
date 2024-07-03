import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export const usersRoutes = async (app: FastifyInstance) => {
  app.post("/", async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUserBodySchema.parse(req.body);

    await knex("users").insert({
      id: randomUUID(),
      name,
    });

    return reply.status(201).send("User created");
  });
};
