const { Database } = require("../../classes.js");
/**
 *
 * @param {any} data
 * @param {Database} db
 * @param {Function} callback
 */
module.exports = (data, db, callback) => {
  const { token } = data.cookie;
  if (!token) return callback(new Error("Invalid cookie token"));
  if (!db.getUserByToken(token).isAdmin)
    return callback(new Error("Not an admin"));
  if (Object.values(db.get("users")).length < 1)
    return callback(null, { message: "No Users Found!" });

  callback(null, db.get("users"));
};
