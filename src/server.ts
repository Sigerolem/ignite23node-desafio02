import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'
import fastifyCookie from '@fastify/cookie'
import 'dotenv'

const app = fastify()

app.register(fastifyCookie)

app.register(mealsRoutes, {
  prefix: 'meals'
})

app.register(usersRoutes, {
  prefix: 'users'
})

const port = process.env.PORT

app.listen({
  host: '0.0.0.0',
  port: parseInt(port ?? '10000')
})

console.log(`Listening on port ${port}`)