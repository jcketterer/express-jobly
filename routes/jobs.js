'use strict'

/** Routes for jobs. */

const jsonschema = require('jsonschema')

const express = require('express')
const { BadRequestError } = require('../expressError')
const { ensureIsAdmin } = require('../middleware/auth')
const Job = require('../models/job')
const jobNewSchema = require('../schemas/jobNew.json')
const jobUpdateSchema = require('../schemas/jobUpdate.json')
const jobSearchSchema = require('../schemas/jobSearch.json')

const router = express.Router({ mergeParams: true })

/** POST */

router.post('/', ensureIsAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }

    const job = await Job.create(req.body)
    return res.status(201).json({ job })
  } catch (err) {
    return next(err)
  }
})

/** GET */

router.get('/', async function (req, res, next) {
  const q = req.query

  if (q.minSalary !== undefined) q.minSalary = +q.minSalary
  q.hasEquity = q.hasEquity === 'true'

  try {
    const validator = jsonschema.validate(q, jobSearchSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }
    const jobs = await Job.findAll(q)
    return res.json({ jobs })
  } catch (err) {
    return next(err)
  }
})

/** GET /jobs/:id */

router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

/** PATCH /jobs/:id */

router.patch('/:id', ensureIsAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }
    const job = await Job.update(req.params.id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

/** DELETE  */

router.delete('/:id', ensureIsAdmin, async function (req, res, next) {
  try {
    await Job.delete(req.params.id)
    return res.json({ deleted: +req.params.id })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
