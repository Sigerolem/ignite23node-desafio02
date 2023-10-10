import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-exists";


export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies
    try {
      try {
        const user = await knex('users').select('id').where({
          session_id: sessionId
        }).first()

        if (!user) { return reply.status(400).send('Invalid session_id on cookie') }

        const meals = await knex('meals').select().where({
          user_id: user.id
        })
        reply.send({ meals })

      } catch (error) {
        reply.send(error)
      }

    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })

  app.get('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string()
    })

    try {
      const { id } = getMealParamsSchema.parse(request.params)
      try {
        const meal = await knex('meals').select().where({
          id
        }).first()
        reply.send(meal)

      } catch (error) {
        reply.send(error)
      }

    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })

  app.post('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional().nullable(),
      meal_had_at: z.string(),
      is_diet_meal: z.boolean(),
    })

    const { sessionId } = request.cookies

    try {
      const { is_diet_meal, meal_had_at, name, description } = createMealBodySchema.parse(request.body)
      try {
        const user = await knex('users').select('id').where({
          session_id: sessionId
        }).first()

        if (!user) { return reply.status(400).send('Invalid session_id on cookie') }

        await knex('meals').insert({
          id: randomUUID(),
          name,
          is_diet_meal,
          meal_had_at,
          description,
          user_id: user.id,
        })

        reply.status(201).send('Meal registered successfully')

      } catch (error) {
        reply.send(error)
      }

    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })

  app.put('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const editMealParamsSchema = z.object({
      id: z.string()
    })

    const editMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional().nullable(),
      meal_had_at: z.string().optional(),
      is_diet_meal: z.boolean().optional(),
    })

    try {
      const { id } = editMealParamsSchema.parse(request.params)
      const editedMeal = editMealBodySchema.parse(request.body)

      try {
        const meal = await knex('meals').where({
          id
        }).update({ ...editedMeal }).returning('*')

        reply.status(202).send({ meal })
      } catch (error) {
        reply.send(error)
      }
    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })

  app.delete('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string()
    })

    try {
      const { id } = deleteMealParamsSchema.parse(request.params)

      try {
        const result = await knex('meals').where({
          id
        }).del()
        console.log(result)
        if (result === 0) {
          reply.status(400).send('No meal found with provided ID')
        }
        reply.send('Meal deleted successfully')
      } catch (error) {
        reply.send(error)
      }
    } catch (error) {
      const { errors } = error as z.ZodError
      reply.status(400).send(errors)
    }
  })
}