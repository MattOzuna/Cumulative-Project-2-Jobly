"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Jobs {

    /**Create a job, insert into db, and return newly created job
     * 
     * data should be{title, salary, equity, company_handle}
     * 
     * return value should be {id, title, salary, equity, company_handle}
     */

    static async create ({title, salary, equity, company_handle}) {
        const newJob = await db.query(
            `INSERT INTO jobs 
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );
        return newJob.rows[0];
    }

    /**Finds all jobs
     * 
     * Returns [{id, title, salary, equity, company_handle}, ...]
     */
    static async findAll(){
        const jobs = await db.query(
            `SELECT id, 
                    title, 
                    salary, 
                    equity, 
                    company_handle
            FROM jobs`
        );
        return jobs.rows
    }

    /**Finds a job by id
     * 
     * Throws error if id doesn't exist
     * 
     * Returns {id, title, salary, equity, company_handle}
     */

    static async get(id){
        const job = await db.query(
            `SELECT id, 
                    title, 
                    salary, 
                    equity, 
                    company_handle
            FROM jobs
            WHERE id = $1`,
            [id]
        );
        if (!job.rows[0]) throw new NotFoundError(`No job with id = ${id}`)
        return job.rows[0]
    }

    /** Update jobs data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(
            data, 
            {
                companyHandle: "company_handle"
            });
        const idVarIdx = "$" + (values.length+1);
        const jobQuery =`UPDATE jobs 
                        SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id, title, salary, equity, company_handle`;

        const job = await db.query(jobQuery, [...values, id])

        if (job.rows.length === 0) throw new NotFoundError(`No job with id = ${id}`)

        return job.rows[0]
    }

    /**Delete a job by id
     * 
     * Throws error if id doesn't exist
     * 
     * Returns {id, title}
     */

    static async remove(id){
        const job = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id, title`,
            [id]
        );
        if (job.rows.length === 0) throw new NotFoundError(`No job with id = ${id}`)
        return job.rows[0]
    }
}

module.exports = Jobs;