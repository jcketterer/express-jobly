'use strict'

const request = require('supertest')

const app = require('../app')

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
  testJobId
} = require('./_testCommon')

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/************************************** POST /jobs */

describe('POST /jobs', function () {
  test('ok for admin', async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: 'c1',
        title: 'J-new',
        salary: 10,
        equity: '0.2'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(resp.statusCode).toEqual(201)
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'J-new',
        salary: 10,
        equity: '0.2',
        companyHandle: 'c1'
      }
    })
  })

  test('unauthorized for users', async function () {
    const res = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: 'c1',
        title: 'J-new',
        salary: 10,
        equity: '0.2'
      })
      .set('authorization', `Bearer ${u1Token}`)
    expect(res.statusCode).toEqual(401)
  })

  test('bad request with partial data', async function () {
    const res = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: 'c1'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(400)
  })

  test('bad request with incorrect data', async function () {
    const res = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: 'c1',
        title: 'J-new',
        salary: 'this isnt a number!',
        equity: '0.2'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(400)
  })
})

describe('GET /jobs', function () {
  test('works for no user', async function () {
    const res = await request(app).get(`/jobs`)
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'J1',
          salary: 1,
          equity: '0.1',
          companyHandle: 'c1',
          companyName: 'C1'
        },
        {
          id: expect.any(Number),
          title: 'J2',
          salary: 2,
          equity: '0.2',
          companyHandle: 'c1',
          companyName: 'C1'
        },
        {
          id: expect.any(Number),
          title: 'J3',
          salary: 3,
          equity: null,
          companyHandle: 'c1',
          companyName: 'C1'
        }
      ]
    })
  })

  test('filtering works', async function () {
    const res = await request(app).get(`/jobs`).query({ hasEquity: true })
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'J1',
          salary: 1,
          equity: '0.1',
          companyHandle: 'c1',
          companyName: 'C1'
        },
        {
          id: expect.any(Number),
          title: 'J2',
          salary: 2,
          equity: '0.2',
          companyHandle: 'c1',
          companyName: 'C1'
        }
      ]
    })
  })

  test('filter with two filter types', async function () {
    const res = await request(app).get(`/jobs`).query({ minSalary: 2, title: '3' })
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'J3',
          salary: 3,
          equity: null,
          companyHandle: 'c1',
          companyName: 'C1'
        }
      ]
    })
  })

  test('bad request with invaild filter data', async function () {
    const res = await request(app).get(`/jobs`).query({ minSalary: 2, nahhh: 'bruhhh' })
    expect(res.statusCode).toEqual(400)
  })
})

describe('GET /jobs/:id', function () {
  test('works for anyone', async function () {
    const res = await request(app).get(`/jobs/${testJobId[0]}`)
    expect(res.body).toEqual({
      job: {
        id: testJobId[0],
        title: 'J1',
        salary: 1,
        equity: '0.1',
        company: {
          handle: 'c1',
          name: 'C1',
          description: 'Desc1',
          numEmployees: 1,
          logoUrl: 'http://c1.img'
        }
      }
    })
  })

  test('no found with incorrect job id', async function () {
    const res = await request(app).get(`/jobs/0`)
    expect(res.statusCode).toEqual(404)
  })
})

describe('PATCH /jobs/:id', function () {
  test('works for admin', async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobId[0]}`)
      .send({
        title: 'J-New'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'J-New',
        salary: 1,
        equity: '0.1',
        companyhandle: 'c1'
      }
    })
  })

  test('unauthorization for any one but admin', async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobId[0]}`)
      .send({
        title: 'J-New'
      })
      .set('authorization', `Bearer ${u1Token}`)
    expect(res.statusCode).toEqual(401)
  })

  test('not found for incorrect job id', async function () {
    const res = await request(app)
      .patch(`/jobs/0`)
      .send({
        handle: 'new'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(400)
  })

  test('bad request on job handle req', async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobId[0]}`)
      .send({
        handle: 'new'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(400)
  })

  test('bad request with incorrect data', async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobId[0]}`)
      .send({
        salary: 'noope, not a number'
      })
      .set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(400)
  })
})

describe('DELETE /job/:id', function () {
  test('works for admin', async function () {
    const res = await request(app).delete(`/jobs/${testJobId[0]}`).set('authorization', `Bearer ${adminToken}`)
    expect(res.body).toEqual({ deleted: testJobId[0] })
  })

  test('unauthorized for non-admin', async function () {
    const res = await request(app).delete(`/jobs/${testJobId[0]}`).set('authorization', `Bearer ${u1Token}`)
    expect(res.statusCode).toEqual(401)
  })

  test('unauthorized for none one signed in', async function () {
    const res = await request(app).delete(`/jobs/${testJobId[0]}`)
    expect(res.statusCode).toEqual(401)
  })

  test('not found or no jobs', async function () {
    const res = await request(app).delete(`/jobs/0`).set('authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toEqual(404)
  })
})
