import { test, beforeAll, afterAll, beforeEach, describe, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

// cria um contexto apenas para essas rotas
describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // testes e2e sao custosos(igual amigos->poucos e bons)

  test('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })
  // JAMAIS devo escrever um teste que depende de outro teste
  test('should be able to list all transactions', async () => {
    const createTrasactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionResponse.get('Set-Cookie')

    // Verifica se os cookies estão definidos antes de usá-los
    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'new transaction',
          amount: 5000,
        }),
      ])
    } else {
      throw new Error('No cookies returned from the transaction creation')
    }
  })

  test('should be able to get a specific transaction', async () => {
    const createTrasactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionResponse.get('Set-Cookie')

    // Verifica se os cookies estão definidos antes de usá-los
    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTrasactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

      expect(getTrasactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          title: 'new transaction',
          amount: 5000,
        }),
      )
    } else {
      throw new Error('No cookies returned from the transaction creation')
    }
  })

  test('should be able to get the summary', async () => {
    const createTrasactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionResponse.get('Set-Cookie')

    // Verifica se os cookies estão definidos antes de usá-los
    if (cookies) {
      // Colocando uma segunda transacao com o mesmo cookie
      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
          title: 'debit transaction',
          amount: 2000,
          type: 'debit',
        })

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)
      expect(summaryResponse.body.summary).toEqual({ amount: 3000 })
    } else {
      throw new Error('No cookies returned from the transaction creation')
    }
  })
})

// Testes automatizados:
// Unitários: unidade da sua aplicacao, uma pequena parte de forma isolada
// Integração: comunicação entre duas os mais unidades.
// e2e-(ponta a ponta): simulam um user operando nossa aplicação

// front-end: abre a pagina de login, digite o texto diego@rocketseat.com, clique no button...
// back-end: chamadas HTTP, WebSockets

// Pirâmide de Testes: para quem nunca fez, bom iniciar pelo E2E, pois nn denpendem de: nenhuma tecnologia, nenhuma arquitetura
// E2E sao testes extramente lentos, pois testam tudo
