'use strict';

const db = require('../db');
const { UnauthorizedError, BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

class Stock {

    /** This will insert the stocks that the
     *  user wants to follow
     */
    static async stockWatch({username, stock}) {
        const result = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        if (!result.rows[0]) {
            throw new UnauthorizedError("Invalid User");
        }

        const id = result.rows[0].id;
        
        const resStock = await db.query(
            `SELECT ticker
             FROM user_stocks
             WHERE user_id = $1
             AND ticker = $2`,
            [id, stock]
        )

        if (resStock.rows[0]) {
            throw new BadRequestError("User already following this stock")
        }

        const res = await db.query(
            `INSERT INTO user_stocks
                (user_id,
                ticker)
                VALUES ($1, $2)
                RETURNING user_id, ticker`,
            [id, stock]
        );

        stock = res.rows[0];
        
        return stock;
    }

    /** This will insert the data for the stocks 
     *  that the user owns so they can keep track
     *  of thier gains/losses.
     */
    static async stockOwn(
        { username, ticker, date_bought, price, qty }) {

        const result = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        if (!result.rows[0]) {
            throw new UnauthorizedError("Invalid user");
        }

        const id = result.rows[0].id;

        const res = await db.query(
            `INSERT INTO user_stocks_own
             (user_id,
              ticker,
              date_bought,
              price,
              qty)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, ticker`,
             [id, ticker, date_bought, price, qty]
        )

        const stockOwn = res.rows[0];
        return stockOwn;
    }

    /** This will return the stocks the given user
     *  has chosen to watch/follow.
     */
    static async getWatch({username}) {
        const res = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        const user_id = res.rows[0].id;

        const stocks = await db.query(
            `SELECT ticker
             FROM user_stocks
             WHERE user_id = $1
             ORDER BY ticker`,
            [user_id]
        );

        const tickers = stocks.rows.map(t => t['ticker']);
        return tickers;
    }

    /** This will return the stocks the given user
     *  owns so the user can see their gains/losses.
     */
    static async getOwn({username}) {
        const res = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        const user_id = res.rows[0].id;

        const stocksOwn = await db.query(
            `SELECT id,
                    ticker,
                    date_bought as date,
                    price as pricepaid,
                    qty
             FROM user_stocks_own
             WHERE user_id = $1
             ORDER BY ticker, date_bought`,
            [user_id]
        )

        return stocksOwn.rows;
    }

    /** This will remove stocks the user no longer
     *  wants to watch/follow.
     */
    static async removeWatch({username, stock}) {
        const result = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        if (!result.rows[0]) {
            throw new UnauthorizedError("Invalid User");
        }

        const id = result.rows[0].id;
        
        const res = await db.query(
            `DELETE FROM user_stocks
                WHERE user_id = $1
                AND ticker = $2`,
            [id, stock]
        )
        
        return 'success';
    }

    /** This will remove a selected stock the user owns
     *  from the database.
     */
    static async removeOwn({id}) {
        const res = await db.query(
            `DELETE FROM user_stocks_own
             WHERE id = $1`,
            [id]
        )

        return 'success';
    }

    /** This will update a stock the user owns.  Not sure
     *  if I'm going to need this.  Not looking like it.
     */
    static async update(id, ticker, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data, {});
        const idIdx = "$" + (values.length + 1);
        const tickerIdx = "$" + (values.length + 2);

        const querySql = `UPDATE user_stocks_own
                          SET ${setCols}
                          WHERE user_id = ${idIdx}
                          AND ticker = ${tickerIdx}
                          RETURNING ticker,
                                    date_bought,
                                    price,
                                    qty`;
        const result = await db.query(querySql, [...values, id, ticker]);
        const stock = result.rows[0];

        if (!stock) throw new NotFoundError(`Invalid user or ticker`);

        return stock;
    }
}

module.exports = Stock;