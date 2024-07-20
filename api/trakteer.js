const { Database } = require("../classes");

/**
 *
 * @param {{cookie: {token: string}}} data
 * @param {Database} db
 * @param {Function} callback
 */

module.exports = (data, db, callback) => {
  console.log(data.body);
  callback(null, { status: 200, success: true });
};
