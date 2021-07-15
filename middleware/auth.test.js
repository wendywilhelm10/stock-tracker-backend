'use strict'

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');
const { authenticate } = require('../models/user');
const {
    authenticateJWT,
    ensureLoggedIn
} = require('./auth');

const testJWT = jwt.sign({ username: 'test' }, SECRET_KEY);
const badJWT = jwt.sign({ username: 'test'}, 'wrong_key');

describe('authenticateJWT', function() {
    test('works: via header', function() {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJWT}`}};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: 'test'
            }
        });
    });

    test('works: no header', function() {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        }
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test('works: invalid token', function() {
        expect.assertions(1);
        const req = { headers: { authorization: `Bearer ${badJWT}` }};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        }
        authenticate(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe('ensureLoggedIn', function() {
    test('works', function() {
        expect.assertions(1);
        const req = {};
        const res = { locals: { user: { username: 'test1' } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    });

    test('unauth if no login', function() {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
        ensureLoggedIn(req, res, next);
    });
})