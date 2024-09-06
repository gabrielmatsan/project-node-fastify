// o d desse arquivo vem de defincao de tipos

// eslint-disable-next-line
import { Knex } from 'knex'

// criamos uma interface e colocamos as Tables que nosso db tem, no caso, colocamos a tabela transactions, caso o dado for opcional, colocamos o "?:" em vez de ":".

declare module 'knex/types/tables' {
  export interface Table {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
