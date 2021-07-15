'use strict';

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureLoggedIn } = require('..//middleware/auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');

const userUpdateSchema = require('../schemas/userUpdate.json');

const router = new express.Router();

/** This will update the profile information for the user. */
router.patch('/:id', ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.update(req.params.id, req.body);
        return res.json({ user })
    } catch(err) {
        return next(err);
    }
})

router.post('/profile', ensureLoggedIn, async function(req, res, next) {
    try {
        const user = await User.getUserInfo(req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;