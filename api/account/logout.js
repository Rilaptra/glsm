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
  if (user) user.token = "NULL";
  db.updateUser(user.id, user);
  callback(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": `token=null; Expires=${new Date(
        Date.now() + 10000
      ).toUTCString()}; Max-Age=10; HttpOnly; Path=/;`,
      "Access-Control-Expose-Headers": "Set-Cookie",
    },
  });
};
