'use strict';

const bcrypt = require('bcrypt');

const db = require('../db');
const { BCRYPT_WORK_FACTOR } = require('../config');

async function commonBeforeAll() {
    await db.query('DELETE FROM users');

    await db.query(`
    INSERT INTO users(id,
                      username,
                      password,
                      first_name,
                      last_name,
                      email)
    VALUES (1, 'u1', $1, 'U1F', 'U1L', 'u1@gmail.com'),
           (2, 'u2', $2, 'U2F', 'U2L', 'u2@gmail.com')
    RETURNING id, username`,
    [
        await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
        await bcrypt.hash('password2', BCRYPT_WORK_FACTOR)
    ]);
}

async function commonBeforeEach() {
    await db.query('BEGIN');
}

async function commonAfterEach() {
    await db.query('ROLLBACK');
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
};