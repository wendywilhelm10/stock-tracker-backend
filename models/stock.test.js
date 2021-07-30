'use strict';

const db = require('../db');
const Stock = require('./stock');
const { UnauthorizedError,
        BadRequestError,
        NotFoundError } = require('../expressError');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe('stock user to watch', function() {
    test('works adding stock', async function() {
        const res = await Stock.stockWatch({username: 'u1', stock: 'NVDA'});
        expect(res).toEqual({user_id: 1,
                             ticker: 'NVDA'});
        const found = await db.query("SELECT * FROM user_stocks WHERE user_id = 1 AND ticker='NVDA'");
        expect(found.rows.length).toEqual(1);
    })

    test('fails with invalid user', async function() {
        try {
            await Stock.stockWatch({username: 'bad', stock: 'SHOP'});
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    })

    test('fails watching same stock', async function() {
        try {
            await Stock.stockWatch(
                {username: 'u1', stock: 'NVDA'}
            );
            await Stock.stockWatch(
                {username: 'u1', stock: 'NVDA'}
            )
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
})

describe('stock user owns', function() {
    test('works adding stock user owns', async function() {
        const res = await Stock.stockOwn(
            {username: 'u2',
             ticker: 'SQ',
             date_bought: '2019-01-01',
             price: 100.50,
             qty: 50
        })
        const found = await db.query("SELECT * FROM user_stocks_own WHERE user_id=2 AND ticker='SQ' AND date_bought='2019-01-01' AND price=100.50 AND qty=50");
        expect(found.rows.length).toEqual(1);
    })

    test('fails with invalid user', async function() {
        try {
            await Stock.stockOwn(
                {username: 'bad',
                 ticker: 'DOCU',
                 date_bought: '2019-01-01',
                 price: 100,
                 qty: 25
            })
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    })
})
        