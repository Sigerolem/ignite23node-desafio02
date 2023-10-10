import 'dotenv/config'
import { Knex, knex as setupKnex } from 'knex'


export const config: Knex.Config = {
  client: process.env.DATABASE_CLIENT,
  connection: process.env.DATABASE_CLIENT === 'sqlite' ? {
    filename: process.env.DATABASE_URL ?? ''
  }
    : process.env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    tableName: 'migrations',
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = setupKnex(config)