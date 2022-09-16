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
    *
    * filtering added
    */

    // static async findAll() {
    //     const results = await db.query(`
    //         SELECT * FROM jobs; 
    //     `)

    //     return results.rows;
    // }

    static async findAll(q = {}) {
        let queryString = `
            SELECT title, salary, equity, company_handle
            FROM jobs
        `;

        let whereExpressions = [];
        let queryValues = [];

        const {title, minSalary, hasEquity} = q;
        //title = title.toLowerCase()

        
        if (minSalary < 0) {
            throw new BadRequestError("The salary cannot be a negative number");
        }
  
      if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
      }

      if (hasEquity === "true") {
        //queryValues.push(hasEquity);
        whereExpressions.push(`equity > 0`);
      }

    //   if (hasEquity === false) {
    //     queryValues.push(hasEquity);
    //     whereExpressions.push(`equity > 0 OR equity `)
    //   } 
  
      if (title !== undefined) {
        queryValues.push(`%${title}%`);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
      }
  
      
  
      if (whereExpressions.length > 0) {
        queryString += " WHERE " + whereExpressions.join(" AND ");
      }

      queryString += " ORDER BY title";
        const jobsRes = await db.query(queryString, queryValues);
        return jobsRes.rows;
  
    }

    /*
    *Filter validation so that inappropriate query strings cannot be used
    */

    static filterValidation(obj) {
        const validQuery = ['title', 'minSalary', 'hasEquity']
        const keys = Object.keys(obj)
        if (keys.length === 0) {
            return true;
        }
        if (keys.length !== 0) {
            if (!keys.every(e => validQuery.includes(e))) {
                return false;
            }
            console.log(keys)
            return true; 
        } else {
            return false;
        }
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