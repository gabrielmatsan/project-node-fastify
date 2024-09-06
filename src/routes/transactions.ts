import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

// Requets body: HTTPs ->

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select()
    return { transactions }
  })

  // http://localhost:3333/transactions/:id
  app.get('/:id', async (request) => {
    const getTrasactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    // const params = getTrasactionsParamsSchema.parse(request.params)

    const { id } = getTrasactionsParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return transaction
  })

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

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    // Query builders possuem limitacoes, caso apague os items dentro de transactions, ele nao consegue sugerir quais podem ser opcionais, obrigatorios etc. Isso sendo um dos motivos de usarmos ORMs

    return reply.status(201).send()
  })
}
