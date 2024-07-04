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

  app.put(
    "/:mealId",
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const updateMealParamsSchema = z.object({
        mealId: z
          .string({
            message: "Meal ID is missing.",
          })
          .uuid(),
      });

      const { mealId } = updateMealParamsSchema.parse(req.params);

      const updateMealBodySchema = z.object({
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

      const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
        req.body
      );

      const meal = await knex("meals").where({ id: mealId }).first();

      if (!meal) {
        return reply.status(404).send("Meal not found.");
      }

      await knex("meals").where({ id: mealId }).update({
        name,
        description,
        isOnDiet,
        date: date.getTime(),
      });

      return reply.status(204).send();
    }
  );

  app.get("/", { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    const meals = await knex("meals")
      .where({ user_id: req.user?.id })
      .orderBy("date", "desc");

    return reply.status(200).send({
      meals,
    });
  });
};
