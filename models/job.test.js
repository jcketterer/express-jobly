'use strict'

const { NotFoundError, BadRequestError } = require('../expressError')
const db = require('../db.js')
const Job = require('./job.js')
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobId } = require('./_testCommon')

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/**************************** Create */

describe('create', function () {
  let newJob = {
    companyHandle: 'c1',
    title: 'Test',
    salary: 100,
    equity: '0.1'
  }

  test('works: creating job', async function () {
    let job = await Job.create(newJob)
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number)
    })
  })
})

/************************** Find all */

describe('findAll', function () {
  test('works: no filter', async function () {
    let jobs = await Job.findAll()
    expect(jobs).toEqual([
      {
        id: testJobId[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: testJobId[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: testJobId[2],
        title: 'Job3',
        salary: 300,
        equity: '0',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: testJobId[3],
        title: 'Job4',
        salary: null,
        equity: null,
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: by min salary', async function () {
    let jobs = await Job.findAll({ minSalary: 250 })
    expect(jobs).toEqual([
      {
        id: testJobId[2],
        title: 'Job3',
        salary: 300,
        equity: '0',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: by min equity', async function () {
    let jobs = await Job.findAll({ hasEquity: true })
    expect(jobs).toEqual([
      {
        id: testJobId[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: testJobId[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: by min equity and minSalary', async function () {
    let jobs = await Job.findAll({ minSalary: 150, hasEquity: true })
    expect(jobs).toEqual([
      {
        id: testJobId[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: by name', async function () {
    let job = await Job.findAll({ title: 'Job1' })
    expect(job).toEqual([
      {
        id: testJobId[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })
})

/************************** get */

describe('get', function () {
  test('works as intended', async function () {
    let job = await Job.get(testJobId[0])
    expect(job).toEqual({
      id: testJobId[0],
      title: 'Job1',
      salary: 100,
      equity: '0.1',
      company: {
        handle: 'c1',
        name: 'C1',
        description: 'Desc1',
        numEmployees: 1,
        logoUrl: 'http://c1.img'
      }
    })
  })

  test('not found if no such job', async function () {
    try {
      await Job.get(0)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})

/************************** update*/

describe('update', function () {
  let updateData = {
    title: 'New',
    salary: 500,
    equity: '0.5'
  }
  test('works as intended', async function () {
    let job = await Job.update(testJobId[0], updateData)
    expect(job).toEqual({
      id: testJobId[0],
      companyhandle: 'c1',
      ...updateData
    })
  })

  test('not found if no job found', async function () {
    try {
      await Job.update(0, {
        title: 'test'
      })
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })

  test('bad request when no data provided', async function () {
    try {
      await Job.update(testJobId[0], {})
      fail()
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  })
})

/************************** remove*/

describe('delete', function () {
  test('works as intended', async function () {
    await Job.delete(testJobId[0])
    const res = await db.query('SELECT id FROM jobs WHERE id = $1', [testJobId[0]])
    expect(res.rows.length).toEqual(0)
  })

  test('not found with job not found', async function () {
    try {
      await Job.delete(0)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})
