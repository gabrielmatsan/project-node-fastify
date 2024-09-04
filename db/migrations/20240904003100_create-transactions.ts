import type { Knex } from 'knex'
// type ?

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}

// npm run knex -- migrate:make {nome da migrate} para fazer a migration
// npm run knex -- migrate:rollback para desfazer a migration
// npm run knex -- migrate:make add-session-id-to-transactions
// npm run knex -- migrate:latest adiciona ao database
