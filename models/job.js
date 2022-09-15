"use strict";

const { max } = require("pg/lib/defaults");
const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {
    /*
    *Create a Job (from data), update db, return new job data.
    *
    * data should be {title, salary, equity, company_handle}
    * 
    * Returns {id, title, salary, equity, company_handle}
    * 
    * Throws BadRequestError if job already in database.
    */

    static async create({title, salary, equity, company_handle}) {
        const results = await db.query(`
            INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle
        `, [title, salary, equity, company_handle])

        const job = results.rows[0]
        return job;
    }

    /*
    *Finds all jobs available
    */

    static async findAll() {
        const results = await db.query(`
            SELECT * FROM jobs; 
        `)

        return results.rows;
    }

    /*
    *Get details on specific job
    */

    static async get(id) {
        const results = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE id=$1
        `, [id]);

        const job = results.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    /*
    *Update a specific job
    */

    static async update(id, data) {
        const {setCols, values} = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle`;

        const results = await db.query(querySql, [...values, id]);
        const job = results.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    /*
    *Delete specific job, return undefined
    */

    static async remove(id) {
        const results = await db.query(`
            DELETE FROM jobs
            WHERE id=$1
            RETURNING id`, [id]);
        const job = results.rows[0];
        if(!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;