"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();



/** 
* POST / { job } => { job }
*
* job should be {title, salary, equity, company_handle}
*
*Returns {title, salary, equity, company_handle}
*
*Authorization required= admin
*/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({job})
    } catch(e) {
        return next(e);
    }
})


/*
*GET / 
* shows all jobs available in database
*/

router.get("/", async function(req, res, next) {
    try {
        if (!Job.filterValidation(req.query)) {
            throw new ExpressError("This includes an invalid query string", 404);
          }
        const jobs = await Job.findAll(req.query);
        return res.json({jobs})
    } catch(e) {
        return next(e);
    }
})

/*
*GET /id
*
*get specific job information
*/

router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch(e) {
        return next(e);
    }
})

/*
* PATCH
*
*patches job data
*
*Fields can be {title, salary, equity}
*/

router.patch("/:id", ensureAdmin, async function(req, res, next){
    try {   
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({job});
    } catch(e) {
        return next(e);
    }
})

/*
*DELETE specific job
*
*must be admin
*/

router.delete("/:id", ensureAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({deleted: req.params.id});
    } catch(e) {
        return next(e);
    }
})

module.exports = router;