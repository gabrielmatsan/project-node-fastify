// biblioteca zod para validacao de dados, inclusive variaveis de ambiente, npm i zod

import { config } from 'dotenv'
import { z } from 'zod'

// NODE_ENV: development, test, production

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333), // por ter colocado um valor default nela, mesmo sem essa variavel em .env,pode ser executada
})

/* 
// exporta com o a tratativa de erro sendo executada pelo zod
export const env = envSchema.parse(process.env)
// o metodo parse, caso de um erro, nao eh tao descritivo, logo o safeParse eh melhor, pois nao dispara o erro */

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
