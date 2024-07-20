const { Database } = require("../../classes");

/**
 *
 * @param {{cookie: {token: string}}} data
 * @param {Database} db
 * @param {Function} callback
 */

module.exports = (data, db, callback) => {
  const token = data.cookie.token;
  const user = db.getUserByToken(token);
  callback(null, { status: user ? 200 : 401, user: user });
};
