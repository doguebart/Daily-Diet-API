import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post("/", { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string({
        message: "Meal name is missing.",
      }),
      description: z.string({
        message: "Meal description is missing.",
      }),
      isOnDiet: z.boolean({
        message: "Tell us if this meal is inside your diet or not.",
      }),
      date: z.coerce.date({
        message: "Date & time is missing.",
      }),
    });

    const { name, description, isOnDiet, date } = createMealsBodySchema.parse(
      req.body
    );

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      isOnDiet,
      user_id: req.user?.id,
      date: date.getTime(),
    });

    return reply.status(201).send();
  });
};
