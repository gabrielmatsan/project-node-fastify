import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies <-> Formas da gente manter contexto entre requisições
// para trabalhar com cookies instalar npm i @fastify/cookie

export async function transactionsRoutes(app: FastifyInstance) {
  // Hook fica para todas as rotas transactions, mas apenas essa. apenas se colocasse diretamente no proprio server
  app.addHook('preHandler', async (request) => {
    // poderia colocar a function checkSessionIdExists
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    // retirei o reply por nao estar sendo utilizado, mas colocar se der erro
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .select()
        .where('session_id', sessionId)
      return { transactions }
    },
  )

  // http://localhost:3333/transactions/:id
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTrasactionsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      // const params = getTrasactionsParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const { id } = getTrasactionsParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post('/', async (request, reply) => {
    // {title, amount, type:credit or debit}

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    // Query builders possuem limitacoes, caso apague os items dentro de transactions, ele nao consegue sugerir quais podem ser opcionais, obrigatorios etc. Isso sendo um dos motivos de usarmos ORMs

    return reply.status(201).send()
  })
}
