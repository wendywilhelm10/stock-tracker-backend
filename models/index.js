'use strict';

const db = require('../db');
const { UnauthorizedError } = require('../expressError');

class Index {

    /** This will retrieve all of the indexes the user
     *  can choose to follow.
     */
    static async getIndices() {
        const result = await db.query(
            `SELECT id,
                    index_ticker,
                    indexname
             FROM indices
             WHERE id >= 4`
        )

        return(result.rows);
    }

    /** This will insert the indices that the
     *  user wants to follow.  Accepts the username
     *  a list of indices in an array.
     */
    static async indexWatch({username, indices}) {
        const result = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        if (!result.rows[0]) {
            throw new UnauthorizedError("Invalid User");
        }

        const user_id = result.rows[0].id;
        const resDel = await db.query(
            `DELETE FROM user_indices
             WHERE user_id = $1`,
            [user_id]
        )

        let retArr = [];
        
        for (let i = 0; i < indices.length; i++) {
            const res = await db.query(
                `INSERT INTO user_indices
                 (user_id,
                  index_id)
                 VALUES ($1, $2)
                 RETURNING user_id, index_id`,
                [user_id, indices[i]]
            )
            retArr.push(res.rows[0].index_id);
        }
        
        return retArr;
    }

    /** This will return the indices that the given
     *  user is following
     */
    static async getIndexWatch({username}) {
        const result = await db.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        )

        const user_id = result.rows[0].id;
          
        const res = await db.query(
            `SELECT i.id,
                    i.index_ticker,
                    i.indexname
             FROM user_indices ui,
                  indices i
             WHERE ui.user_id = $1
             AND ui.index_id = i.id
             ORDER BY i.id`,
            [user_id]
        )

        return(res.rows);
    }

    static async getThree() {
        const res = await db.query(
            `SELECT id,
                    index_ticker,
                    indexName
             FROM indices
             WHERE id <= 3
             ORDER BY id`
        )

        return(res.rows);
    }
       
}

module.exports = Index;