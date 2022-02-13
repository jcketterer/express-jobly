const { BadRequestError } = require('../expressError')

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * Helper function to easily create a SET clause portion of an UPDATE query
 *
 * @param dataToUpdate is an {Object} of the data that will be included in the SET clause
 * @param jsToSql will convert the the JS style data and convert it to database column names
 * @returns {Object} {sqlSetCols, dataToUpdate}
 * @example {firstName: 'Alyssa', age: 23} =>
 *  {setCols: '"first_name"=$1, "age"=$2',
 *   values: ['Alyssa', 23]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate)
  if (keys.length === 0) throw new BadRequestError('No data')

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`)

  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate)
  }
}

module.exports = { sqlForPartialUpdate }
