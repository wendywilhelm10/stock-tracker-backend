'use strict';

const { Client } = require('pg');
const { getDatabase } = require('./config');

const db = new Client({
    connectionString: getDatabase()
});

db.connect();

module.exports = db;