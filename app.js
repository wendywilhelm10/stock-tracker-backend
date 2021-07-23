'use strict';

const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');

const { authenticateJWT } = require('./middleware/auth');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const indexRoutes = require('./routes/index');

const morgan = require('morgan');

const app = express();

// app.use(cors({
//     credentials: true,
//     preflightContinue: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     origin: false
// }));

app.use(morgan('tiny'));
app.use(authenticateJWT);

// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/stock', stockRoutes);
app.use('/index', indexRoutes);

// Error for page not found, 404 error
app.use(function(req, res, next) {
    return next(new NotFoundError());
})

// Generic error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    return res.json({
        error: err.message,
        status: err.status
    })
});

module.exports = app;