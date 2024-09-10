"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_child_process_1 = require("node:child_process");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
// cria um contexto apenas para essas rotas
(0, vitest_1.describe)('Transactions routes', () => {
    (0, vitest_1.beforeAll)(async () => {
        await app_1.app.ready();
    });
    (0, vitest_1.afterAll)(async () => {
        await app_1.app.close();
    });
    (0, vitest_1.beforeEach)(() => {
        (0, node_child_process_1.execSync)('npm run knex migrate:rollback --all');
        (0, node_child_process_1.execSync)('npm run knex migrate:latest');
    });
    // testes e2e sao custosos(igual amigos->poucos e bons)
    (0, vitest_1.test)('should be able to create a new transaction', async () => {
        await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'new transaction',
            amount: 5000,
            type: 'credit',
        })
            .expect(201);
    });
    // JAMAIS devo escrever um teste que depende de outro teste
    (0, vitest_1.test)('should be able to list all transactions', async () => {
        const createTrasactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'new transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = createTrasactionResponse.get('Set-Cookie');
        // Verifica se os cookies estão definidos antes de usá-los
        if (cookies) {
            const listTransactionsResponse = await (0, supertest_1.default)(app_1.app.server)
                .get('/transactions')
                .set('Cookie', cookies)
                .expect(200);
            (0, vitest_1.expect)(listTransactionsResponse.body.transactions).toEqual([
                vitest_1.expect.objectContaining({
                    title: 'new transaction',
                    amount: 5000,
                }),
            ]);
        }
        else {
            throw new Error('No cookies returned from the transaction creation');
        }
    });
    (0, vitest_1.test)('should be able to get a specific transaction', async () => {
        const createTrasactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'new transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = createTrasactionResponse.get('Set-Cookie');
        // Verifica se os cookies estão definidos antes de usá-los
        if (cookies) {
            const listTransactionsResponse = await (0, supertest_1.default)(app_1.app.server)
                .get('/transactions')
                .set('Cookie', cookies)
                .expect(200);
            const transactionId = listTransactionsResponse.body.transactions[0].id;
            const getTrasactionResponse = await (0, supertest_1.default)(app_1.app.server)
                .get(`/transactions/${transactionId}`)
                .set('Cookie', cookies)
                .expect(200);
            (0, vitest_1.expect)(getTrasactionResponse.body.transaction).toEqual(vitest_1.expect.objectContaining({
                title: 'new transaction',
                amount: 5000,
            }));
        }
        else {
            throw new Error('No cookies returned from the transaction creation');
        }
    });
    (0, vitest_1.test)('should be able to get the summary', async () => {
        const createTrasactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'Credit transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = createTrasactionResponse.get('Set-Cookie');
        // Verifica se os cookies estão definidos antes de usá-los
        if (cookies) {
            // Colocando uma segunda transacao com o mesmo cookie
            await (0, supertest_1.default)(app_1.app.server)
                .post('/transactions')
                .set('Cookie', cookies)
                .send({
                title: 'debit transaction',
                amount: 2000,
                type: 'debit',
            });
            const summaryResponse = await (0, supertest_1.default)(app_1.app.server)
                .get('/transactions/summary')
                .set('Cookie', cookies)
                .expect(200);
            (0, vitest_1.expect)(summaryResponse.body.summary).toEqual({ amount: 3000 });
        }
        else {
            throw new Error('No cookies returned from the transaction creation');
        }
    });
});
// Testes automatizados:
// Unitários: unidade da sua aplicacao, uma pequena parte de forma isolada
// Integração: comunicação entre duas os mais unidades.
// e2e-(ponta a ponta): simulam um user operando nossa aplicação
// front-end: abre a pagina de login, digite o texto diego@rocketseat.com, clique no button...
// back-end: chamadas HTTP, WebSockets
// Pirâmide de Testes: para quem nunca fez, bom iniciar pelo E2E, pois nn denpendem de: nenhuma tecnologia, nenhuma arquitetura
// E2E sao testes extramente lentos, pois testam tudo
