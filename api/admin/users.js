const { Database, User, Script } = require("../../classes.js");
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

  const users = Object.values(db.get("users")).map(
    /**
     * @param {User} user
     * @returns {{id: string, name: string, roles: {name: string, color:string}[], scripts: string[]}}
     */
    (user) => {
      return {
        id: user.id,
        name: user.discord.username,
        roles: [
          {
            name: user.isAdmin ? "Admin" : "User",
            color: user.isAdmin ? "green" : "blue",
          },
          {
            name: `${user.scriptBuyed.length} Scripts`,
            color: "orange",
          },
        ],
        scripts: user.scriptBuyed,
      };
    }
  );
  // Sort users by name in ascending order
  users.sort((a, b) => a.name.localeCompare(b.name));
  // Log the users to the console for debugging purposes
  console.table(users);
  callback(null, users);
};
