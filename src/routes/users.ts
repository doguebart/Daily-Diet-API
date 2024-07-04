import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export const usersRoutes = async (app: FastifyInstance) => {
  app.post("/", async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    const { name, email } = createUserBodySchema.parse(req.body);

    if (!name) {
      return reply.status(400).send("Field name is missing!");
    }

    if (!email) {
      return reply.status(400).send("Field e-mail is missing!");
    }

    const checkIfUserExists = await knex("users").where({ email }).first();

    if (checkIfUserExists) {
      return reply.status(400).send("User already exists.");
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
};
