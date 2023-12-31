import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string,
      session_id: string,
      user_name: string,
      created_at: string,
    },
    meals: {
      id: string,
      user_id: string,
      name: string,
      description?: string | null,
      meal_had_at: string,
      is_diet_meal: boolean,
      created_at: string
    }
  }
}