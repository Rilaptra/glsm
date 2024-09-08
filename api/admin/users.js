const { Database, User, Script } = require("../../classes.js");
/**
 * GET: Get all users in database
 * PUT: Adding admin role to user with given userId
 * POST: Removing admin role to user with given userId
 * DELETE: Delete user with given userId from database
 *
 * @param {{req: Request}} data
 * @param {Database} db
 * @param {Function} callback
 */
module.exports = (data, db, callback) => {
  const { token } = data.cookie;
  if (!token) return callback(new Error("Invalid cookie token"));
  console.log(db.getUserByToken(token));
  if (!db.getUserByToken(token).isAdmin)
    return callback(new Error("Not an admin"));

  if (data.req.method === "GET") {
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
          profile: user.discord.avatarUrl,
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
    callback(null, users);
    return;
  }
  const { userId } = data.body;
  const user = db.getUser(userId);
  if (!user) return callback(new Error("User not found"));

  switch (data.req.method) {
    case "PUT":
      // Adding admin role to user with id userId
      user.isAdmin = true;
      callback(null, { message: "User updated successfully" });
      break;

    case "POST":
      // Removing admin role from user with id userId
      user.isAdmin = false;
      callback(null, { message: "User updated successfully" });
      break;

    case "DELETE":
      // Delete user with id userId from database
      db.deleteUser(userId);
      callback(null, { message: "User deleted successfully" });
      break;

    default:
      break;
  }
  db.updateUser(user.id, user);
};
