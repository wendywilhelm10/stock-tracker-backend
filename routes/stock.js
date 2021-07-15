'use strict';

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureLoggedIn } = require('..//middleware/auth');
const { BadRequestError } = require('../expressError');
const stockWatchSchema = require('../schemas/stockWatch.json');
const stockOwnSchema = require('../schemas/stockOwn.json');
const stockUpdateSchema = require('../schemas/stockUpdate.json');
const Stock = require('../models/stock');

const router = new express.Router();

/** POST / { username, string of ticker symbols to watch
 * 
 *  Adds a record for each ticker symbol the user want to
 *  watch.
 * 
 *  This returns SUCCESS if records are inserted successfully.
 * 
 *  Authorization required: valid username
*/

router.post('/watch', ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, stockWatchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const stockWatch = await Stock.stockWatch({...req.body});
        return res.status(200).json({ stockWatch });
    } catch(err) {
        return next(err);
    }
})

/** POST / { username, ticker symbol, date bought, price ,qty } 
 * 
 *  This will insert a record for the stock the user has purchased.
*/

router.post('/own', ensureLoggedIn, async function(req, res, next) {
    try {
        req.body.price = +req.body.price;
        req.body.qty = +req.body.qty;
        const validator = jsonschema.validate(req.body, stockOwnSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const stockOwn = await Stock.stockOwn({...req.body});
        return res.status(200).json({ stockOwn });
    } catch(err) {
        return next(err);
    }
})

/** POST Route
 * 
 *  This will return the stocks that the logged in user
 *  has previously chosen to watch/follow
 */
router.post('/watchAll', async function(req, res, next) {
    try {
        const stocksWatch = await Stock.getWatch({...req.body});
        return res.json({'stocksWatch': stocksWatch.join(' ') })
    } catch (err) {
        return next(err);
    }
})

/** Post Route
 * 
 *  This will return the stocks that the logged in user 
 *  has previously entered as owning and the information
 *  pertaining to this stock.
 */
router.post('/ownAll', ensureLoggedIn, async function(req, res, next) {
    try {
        const stocksOwn = await Stock.getOwn({...req.body});
        return res.json({stocksOwn});
    } catch (err) {
        return next(err);
    }
})

/** This will delete a stock the user no longer wishes to
 *  watch.
 */
router.delete('/watch', ensureLoggedIn, async function(req, res, next) {
    try {
        const result = await Stock.removeWatch({...req.body});
        return res.json({result});
    } catch (err) {
        return next(err);
    }
})

/** This will delete a stock the user owns. */
router.delete('/own', ensureLoggedIn, async function(req, res, next) {
    try {
        const result = await Stock.removeOwn({...req.body});
        return res.json({result});
    } catch (err) {
        return next(err);
    }
})

/** Don't think I will need this function. */
router.patch('/:id/:ticker', ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, stockUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const stock = await Stock.update(req.params.id, req.params.ticker, req.body);
        return res.json({ stock })
    } catch (err) {
        return next(err);
    }
})

module.exports = router;