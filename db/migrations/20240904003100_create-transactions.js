"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
// type ?
async function up(knex) {
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary();
        table.text('title').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTable('transactions');
}
// npm run knex -- migrate:make {nome da migrate} para fazer a migration
// npm run knex -- migrate:rollback para desfazer a migration
// npm run knex -- migrate:make add-session-id-to-transactions
// npm run knex -- migrate:latest adiciona ao database
