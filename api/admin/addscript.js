const { Database, Script, User } = require("../../classes");

/**
 *
 * @param {any} data
 * @param {Database} db
 * @param {Function} callback
 */
module.exports = (data, db, callback) => {
  if (!data.body) return callback(new Error("No data provided!"));
  const { id, name, description, link, author, server, price, createdAt } =
    data.body;
  if (!id || !name || !description || !link || !author || !server || !price)
    return callback(new Error("Invalid Property"));
  const newScript = new Script({
    id,
    name,
    description,
    link,
    author,
    server,
    price,
    createdAt,
  });
  db.addScript(newScript);
  callback(null, { message: "Script added successfully!" });
};
