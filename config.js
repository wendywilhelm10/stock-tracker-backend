'use strict';

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || "wendystocktracker";
const PORT = +process.env.PORT || 3001;

// use dev database, testing database or via env var, production database
function getDatabase() {
    // console.log('NODE_ENV ', process.env.NODE_ENV);
    return(process.env.NODE_ENV === 'test')
        ? "stock_tracker_test"
        : process.env.DATABASE_URL || "stock_tracker";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
    PORT,
    SECRET_KEY,
    BCRYPT_WORK_FACTOR,
    getDatabase
};