const { sqlForPartialUpdate } = require('./sql')

describe('func sql partial update', function () {
  test('works for 1 item being updated', function () {
    const result = sqlForPartialUpdate({ firstName: 'Alyssa' }, { firstName: 'first_name' })
    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ['Alyssa']
    })
  })

  test('works for 2 items being updated', function () {
    const result = sqlForPartialUpdate({ firstName: 'Alyssa', age: 23 }, { firstName: 'first_name', age: 'age' })
    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Alyssa', 23]
    })
  })
})
