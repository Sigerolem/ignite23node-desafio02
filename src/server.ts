import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'
import fastifyCookie from '@fastify/cookie'

const app = fastify()

app.register(fastifyCookie)

app.register(mealsRoutes, {
  prefix: 'meals'
})

app.register(usersRoutes, {
  prefix: 'users'
})

app.listen({
  port: 3333
})