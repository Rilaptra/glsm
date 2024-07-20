const fs = require("fs");
const path = require("path");
const { Database } = require("../../classes.js");

/**
 * Reads the database file and returns an array of server objects.
 *
 * @param {Object} data - Additional data that may be used in the function.
 * @param {Database} db - Additional data that may be used in the function.
 * @param {Function} callback - A callback function to handle the result.
 *
 * @returns {void}
 *
 * @callback callback
 * @param {Error|null} error - An error object if an error occurred, otherwise null.
 * @param {any} - An array of server objects if successful.
 */
module.exports = (data, db, callback) => {
  const dbPath = path.join(__dirname, "..", "..", "db.json");
  fs.readFile(dbPath, "utf8", (err, fileContents) => {
    if (err) {
      return callback(new Error("Error reading database file"));
    }

    try {
      const db = JSON.parse(fileContents);
      const servers = Object.values(db.servers);
      if (!Array.isArray(servers)) {
        return callback(new Error("Invalid database structure"));
      }

      callback(null, servers);
    } catch (parseError) {
      callback(new Error("Error parsing database file"));
    }
  });
};
