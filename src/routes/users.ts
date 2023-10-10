import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-exists";


export async function usersRoutes(app: FastifyInstance) {
  app.get('/summary', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies

    try {
      const userMeals = await knex('users')
        .select()
        .where({
          session_id: sessionId
        })
        .first()
        .then(async user => {
          return await knex('meals').select().where({
            user_id: user?.id
          })
        })
      const mealMetrics = userMeals.reduce((initial, meal) => {
        return {
          numberOfMeals: ++initial.numberOfMeals,
          dietMeals: meal.is_diet_meal ? ++initial.dietMeals : initial.dietMeals,
          notDietMeals: meal.is_diet_meal ? initial.notDietMeals : ++initial.notDietMeals,
          currentDietStreak: meal.is_diet_meal ? ++initial.currentDietStreak : 0,
          biggestDietStreak: meal.is_diet_meal
            ? initial.currentDietStreak > initial.biggestDietStreak
              ? initial.currentDietStreak
              : initial.biggestDietStreak
            : initial.biggestDietStreak
        }
      }, {
        numberOfMeals: 0,
        dietMeals: 0,
        notDietMeals: 0,
        currentDietStreak: 0,
        biggestDietStreak: 0
      })

      reply.send({ mealMetrics })
    } catch (error) {
      reply.send(error)
    }

  })

  app.post('/', async (request, reply) => {
    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      })
    }

    const createUserBodySchema = z.object({
      user_name: z.string()
    })

    try {
      const { user_name } = createUserBodySchema.parse(request.body)
      try {
        await knex('users').insert({
          id: randomUUID(),
          user_name,
          session_id: sessionId
        })
        reply.status(201).send('User created successfully')
      } catch (error) {
        reply.send(error)
      }
    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })
}