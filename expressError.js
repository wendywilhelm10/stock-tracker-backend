'use strict';

/* ExpressError extends normal JS Error so we can 
 * assign a status when we make an instance of it.
 */

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

/* 404 Not Found Error. */

class NotFoundError extends ExpressError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

class BadRequestError extends ExpressError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

class UnauthorizedError extends ExpressError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

module.exports = {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
}