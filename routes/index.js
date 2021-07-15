'use strict';

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureLoggedIn } = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const indicesSchema = require('../schemas/indices.json');
const Index = require('../models/index');

const router = new express.Router();

/** This will get all the indexes so the user can choose
 *  which ones to follow.
 */
router.get('/watch', async function(req, res,next) {
    try {
        const indices = await Index.getIndices();
        return res.status(200).json({ indices });
    } catch (err) {
        return next(err);
    }
})

/** This will insert the indexes the user has chosen to 
 *  watch.
 */
router.post('/watch', ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, indicesSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const indices = await Index.indexWatch({...req.body});
        return res.status(200).json({ indices });
    } catch(err) {
        return next(err);
    }
})

/** This will retrieve the indexes the user has chosen to
 *  watch.
 */
router.post('/userWatch', ensureLoggedIn, async function(req, res, next) {
    try {
        const result = await Index.getIndexWatch({...req.body});
        return res.status(200).json({ result });
    } catch(err) {
        return next(err);
    }
})

router.get('/three', ensureLoggedIn, async function(req, res, next) {
    try {
        const result = await Index.getThree();
        return res.status(200).json({ result });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;