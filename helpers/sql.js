const { BadRequestError } = require("../expressError");

/*
*This function serves to create the column names and values that will be passed into 
*an UPDATE SQL query, which allows the model to be only partially updated
*
*The function takes the object keys of dataToUpdate and validates that there are keys to update
*Then it will map each key so the resulting col value contains the column name and $ variable
*
*It ultimately returns an object with all columns and all values that will be fed into the sql
*query
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
