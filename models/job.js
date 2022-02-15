'use strict'

const db = require('../db')
const { NotFoundError } = require('../expressError')
const { sqlForPartialUpdate } = require('../helpers/sql')

class Job {
  //Creates job, inputes data into db, and returns json body of data

  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (title,
                        salary,
                        equity,
                        company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"
    `,
      [data.title, data.salary, data.equity, data.companyHandle]
    )
    let job = result.rows[0]
    return job
  }

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let mainQuery = `SELECT
                        j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                      FROM jobs AS j
                      LEFT JOIN companies AS c
                        ON c.handle = j.company_handle`
    let whereClause = []
    let filterVal = []

    if (minSalary !== undefined) {
      filterVal.push(minSalary)
      whereClause.push(`salary >= $${filterVal.length}`)
    }

    if (hasEquity === true) {
      whereClause.push(`equity > 0`)
    }

    if (title !== undefined) {
      filterVal.push(`%${title}%`)
      whereClause.push(`title ILIKE $${filterVal.length}`)
    }

    if (whereClause.length > 0) {
      mainQuery += ' WHERE ' + whereClause.join(' AND ')
    }

    mainQuery += ' ORDER BY title'
    const jobRes = await db.query(mainQuery, filterVal)
    return jobRes.rows
  }

  static async get(id) {
    const jobRes = await db.query(
      `
        SELECT
          id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1
      `,
      [id]
    )

    const job = jobRes.rows[0]

    if (!job) throw new NotFoundError(`No job: ${id}`)

    const companiesRes = await db.query(
      `
        SELECT
          handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [job.companyHandle]
    )

    delete job.companyHandle
    job.company = companiesRes.rows[0]

    return job
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {})

    const idIndex = '$' + (values.length + 1)

    const sqlQuery = `UPDATE jobs
                        SET ${setCols}
                        WHERE id = ${idIndex}
                        RETURNING id, title, salary, equity, company_handle AS companyHandle`

    const res = await db.query(sqlQuery, [...values, id])
    const job = res.rows[0]

    if (!job) throw new NotFoundError(`No job: ${id}`)

    return job
  }

  static async delete(id) {
    const res = await db.query(
      `
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id
      `,
      [id]
    )
    const job = res.rows[0]
    if (!job) throw new NotFoundError(`No job: ${id}`)
  }
}

module.exports = Job
