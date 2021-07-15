'use strict';

const db = require('../db');
const User = require('./user');
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

/** authenticate */

describe('authenticate', function() {
    test('works', async function() {
        const user = await User.authenticate('u1', 'password1');
        expect(user).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            email: 'u1@gmail.com'
        })
    });

    test('unauth if no such user', async function() {
        try {
            const user = await User.authenticate('nouser', 'invalid');
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }    
    });

    test('unauth if wrong password', async function() {
        try {
            const user = await User.authenticate('u1', 'password');
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
})

/** register */

describe('register', function() {
    const newUser = {
        username: 'new',
        firstName: 'N1F',
        lastName: 'N1L',
        email: 'newuser@gmail.com'
    };

    test('works', async function() {
        let user = await User.register({
            ...newUser, 
            password: 'password'
        });
        expect(user).toEqual(newUser);
        const found = await db.query("SELECT * FROM users WHERE username = 'new'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
    });

    test('bad request with dupe user', async function() {
        try {
            await User.register({
                ...newUser,
                password: 'password'
            });
            await User.register({
                ...newUser,
                password: 'password'
            });
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
})

describe('get user info', function() {
    test('works', async function() {
        const user = await User.getUserInfo({username: 'u1'});
        expect(user).toEqual({
            id: 1,
            first_name: 'U1F',
            last_name: 'U1L',
            email: 'u1@gmail.com'
        });
    });

    test('not found with invalid user', async function() {
        try {
            const user = await User.getUserInfo({username: 'new'});
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})

describe('update user info', function() {
    test('works - one value', async function() {
        let data = { firstName: 'user1F' }
        const user = await User.update(1, data);
        expect(user).toEqual({
            id: 1,
            first_name: 'user1F',
            last_name: 'U1L',
            email: 'u1@gmail.com'
        });
    });

    test('works - two values', async function() {
        let data = { 
            lastName: 'user2Last',
            email: 'user2@gmail.com'
        }
        const user = await User.update(2, data);
        expect(user).toEqual({
            id: 2,
            first_name: 'U2F',
            last_name: 'user2Last',
            email: 'user2@gmail.com'
        });
    });

    test('not found with invalid user', async function() {
        let data = {first_name: 'newUser'}
        try {
            await User.update(0, data);
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})