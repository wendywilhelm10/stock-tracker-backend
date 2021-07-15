'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { 
    BadRequestError,
    UnauthorizedError,
    NotFoundError
} = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

const { BCRYPT_WORK_FACTOR } = require('../config');

class User {
    /** authenticate user with username, password.
     * 
     *  Returns { username, firstName, lastName, email }
     * 
     *  Throws UnauthorizedError is user is not found or invalid
     *  password.
     */

    static async register(
        { username, password, firstName, lastName, email }) {

        const dupCheck = await db.query(
            `SELECT username
             FROM   users
             WHERE  username = $1`,
            [username],
        );

        if (dupCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`)
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const res = await db.query(
            `INSERT INTO users
             (username,
              password,
              first_name,
              last_name,
              email)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING username, first_name AS "firstName", last_name as "lastName", email`,
             [username, 
              hashedPassword, 
              firstName, 
              lastName, 
              email]
        );

        const user = res.rows[0];
        return user;
    }

    /** This will authenticate the user based on the username
     *  and password supplied.  Will make sure they match
     *  before user is allowed perform actions.
     */
    static async authenticate(username, password) {
        // see if user exists first
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email
             FROM users
             WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** This will update user information. */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name"
            });
        const idIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
                          SET ${setCols}
                          WHERE id = ${idIdx}
                          RETURNING id,
                                    first_name,
                                    last_name,
                                    email`;
        const result = await db.query(querySql, [...values, id]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`Invalid user`);

        return user;
    }

    /** Get user info so user can update if they desire */
    static async getUserInfo({username}) {
        const result = await db.query(
            `SELECT id, 
                    first_name,
                    last_name,
                    email
             FROM users
             WHERE username = $1`,
            [username]
        )

        const user = result.rows[0];
        if (!user) throw new NotFoundError('Invalid user');

        return user;
    }
}

module.exports = User;