const { Database, Server } = require("../../classes");

/**
 *
 * @param {any} data
 * @param {Database} db
 * @param {Function} callback
 */
module.exports = (data, db, callback) => {
  if (!data.body) return callback(new Error("No data provided!"));
  const { id, name, description, link, owner, logo, last_updated, rating } =
    data.body;
  if (!id || !name || !description || !link || !owner || !logo || !last_updated)
    return callback(new Error("Invalid Property"));
  const newServer = new Server({
    id,
    name,
    description,
    link,
    owner,
    logo,
    last_updated,
    rating,
  });
  db.addServer(newServer);
  callback(null, { message: "Server added successfully!" });
};
