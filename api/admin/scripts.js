const { Database, Script } = require("../../classes.js");
/**
 * GET: Get all scripts in database
 * PUT: Adding script into database
 * POST: Update the script with given scriptId
 * DELETE: Delete script with given scriptId from database
 * @param {{req: Request, body: {scriptId: string} | {id: string, name: string, description: string, link: string, author: string, server: string, price?: {money?: number | undefined, dl?: number | undefined, } | undefined,createdAt?: string | undefined }}} data
 * @param {Database} db
 * @param {Function} callback
 */
module.exports = (data, db, callback) => {
  const { token } = data.cookie;
  if (!token) return callback(new Error("Invalid cookie token"));
  if (!db.getUserByToken(token).isAdmin)
    return callback(new Error("Not an admin"));
  if (data.req.method === "GET") {
    if (Object.values(db.get("scripts")).length < 1)
      return callback(null, { message: "No Scripts Found!" });
    return callback(null, db.get("scripts"));
  }

  if (data.req.method === "PUT") {
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
    return;
  }

  const { scriptId } = data.body;
  const script = db.getScript(scriptId);
  if (!script) return callback(new Error("Script not found"));

  switch (data.req.method) {
    case "POST":
      db.updateScript(script.id, script);
      callback(null, { message: "Script updated successfully!" });
      break;

    case "DELETE":
      db.deleteScript(scriptId);
      callback(null, { message: "Script deleted successfully!" });
      break;

    default:
      break;
  }
};
