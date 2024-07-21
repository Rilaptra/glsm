const fs = require("fs");

/**
 * @class Database
 * @extends Map
 * @description A custom database class that extends Map for managing users, servers, admins, and scripts.
 */
class Database extends Map {
  /**
   * @constructor
   * @param {string} dbPath - The file path for the JSON database file.
   */
  constructor(dbPath) {
    super();
    this.dbPath = dbPath;
    this.objects = { users: {}, servers: {}, admins: {}, scripts: {} };
    this.load();
  }

  /**
   * @method load
   * @description Loads data from the JSON file into the Map.
   * @throws {Error} If there's an error reading the file (other than file not found).
   * @returns {void}
   */
  load() {
    try {
      const data = fs.readFileSync(this.dbPath, "utf8");
      this.objects = JSON.parse(data);
      for (const [key, value] of Object.entries(this.objects)) {
        this.set(key, value);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("Database file not found. Creating a new one.");
        this.save();
      } else {
        throw error;
      }
    }
  }

  /**
   * @method save
   * @description Saves the current state of the Map to the JSON file.
   * @throws {Error} If there's an error writing to the file.
   * @returns {void}
   */
  save() {
    for (const [key, value] of this.entries()) {
      this.objects[key] = value;
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(this.objects, null, 2));
  }

  /**
   * @method add
   * @description Adds an item to a specified collection.
   * @param {string} collection - The name of the collection to add the item to.
   * @param {{}} item - The item to add.
   * @returns {{}} The added item.
   */
  add(collection, item) {
    if (!this.has(collection)) {
      this.set(collection, {});
    }
    const collectionData = this.get(collection);
    collectionData[item.id] = item;
    console.log(
      `Item with id: ${item.id} has been added to ${collection} collection.`
    );
    this.save();
    return item;
  }

  /**
   * @method update
   * @description Updates an item in a specified collection.
   * @param {string} collection - The name of the collection containing the item.
   * @param {string} id - The ID of the item to update.
   * @param {{}} updates - The updates to apply to the item.
   * @returns {{}} The updated item.
   * @throws {Error} If the collection or item doesn't exist.
   */
  update(collection, id, updates) {
    if (!this.has(collection)) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    const collectionData = this.get(collection);
    if (!collectionData[id]) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    collectionData[id] = { ...collectionData[id], ...updates };
    console.log(updates);
    console.log(
      `Item with id: ${id} has been updated in ${collection} (${new Date()}).`
    );
    this.save();
    return collectionData[id];
  }

  /**
   * @method delete
   * @description Deletes an item from a specified collection.
   * @param {string} collection - The name of the collection containing the item.
   * @param {string} id - The ID of the item to delete.
   * @throws {Error} If the collection or item doesn't exist.
   * @returns {void}
   */
  delete(collection, id) {
    if (!this.has(collection)) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    const collectionData = this.get(collection);
    if (!collectionData[id]) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    delete collectionData[id];
    console.log(
      `Item with id: ${id} has been deleted from ${collection} collection.`
    );
    this.save();
  }

  /**
   * @method reset
   * @description Resets a specified collection to an empty state.
   * @param {string} collection - The name of the collection to reset.
   * @returns {void}
   */
  reset(collection) {
    this.set(collection, {});
    console.log(`The ${collection} colection has been reset! ${new Date()}`);
    this.save();
  }

  /**
   * @method addUser
   * @description Adds a new user to the database.
   * @param {User} user - The user to add.
   * @returns {User} The added user.
   */
  addUser(user) {
    return this.add("users", user);
  }

  /**
   * @method updateUser
   * @description Updates an existing user in the database.
   * @param {string} id - The ID of the user to update.
   * @param {{}} updates - The updates to apply to the user.
   * @returns {User} The updated user.
   */
  updateUser(id, updates) {
    return this.update("users", id, updates);
  }

  /**
   * @method deleteUser
   * @description Deletes a user from the database.
   * @param {string} id - The ID of the user to delete.
   * @returns {void}
   */
  deleteUser(id) {
    return this.delete("users", id);
  }

  /**
   * @method getUser
   * @description Retrieves a user from the database.
   * @param {string} id - The ID of the user to retrieve.
   * @returns {User|null} The retrieved user or null if not found.
   */
  getUser(id) {
    const users = this.get("users");
    return users[id] || null;
  }

  /**
   * @method getUserByToken
   * @description Retrieves a user from the database based on their token.
   * @param {string} token - The unique token of the user to retrieve.
   * @returns {User|null} The retrieved user or null if not found.
   */
  getUserByToken(token) {
    const users = this.get("users");
    return Object.values(users).find((u) => u.token === token) || null;
  }

  /**
   * @method resetUsers
   * @description Resets the users collection to an empty state.
   * @returns {void}
   */
  resetUsers() {
    return this.reset("users");
  }

  /**
   * @method addServer
   * @description Adds a new server to the database.
   * @param {Server} server - The server to add.
   * @returns {Server} The added server.
   */
  addServer(server) {
    return this.add("servers", server);
  }

  /**
   * @method updateServer
   * @description Updates an existing server in the database.
   * @param {string} id - The ID of the server to update.
   * @param {{}} updates - The updates to apply to the server.
   * @returns {Server} The updated server.
   */
  updateServer(id, updates) {
    if (!updates.last_updated) {
      updates.last_updated = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    return this.update("servers", id, updates);
  }

  /**
   * @method deleteServer
   * @description Deletes a server from the database.
   * @param {string} id - The ID of the server to delete.
   * @returns {void}
   */
  deleteServer(id) {
    return this.delete("servers", id);
  }

  /**
   * @method getServer
   * @description Retrieves a server from the database.
   * @param {string} id - The ID of the server to retrieve.
   * @returns {Server|null} The retrieved server or null if not found.
   */
  getServer(id) {
    const servers = this.get("servers");
    return servers[id] || null;
  }

  /**
   * @method resetServers
   * @description Resets the servers collection to an empty state.
   * @returns {void}
   */
  resetServers() {
    return this.reset("servers");
  }

  /**
   * @method addScript
   * @description Adds a new script to the database.
   * @param {Script} script - The script to add.
   * @returns {Script} The added script.
   */
  addScript(script) {
    return this.add("scripts", script);
  }

  /**
   * @method updateScript
   * @description Updates an existing script in the database.
   * @param {string} id - The ID of the script to update.
   * @param {{}} updates - The updates to apply to the script.
   * @returns {Script} The updated script.
   */
  updateScript(id, updates) {
    return this.update("scripts", id, updates);
  }

  /**
   * @method deleteScript
   * @description Deletes a script from the database.
   * @param {string} id - The ID of the script to delete.
   * @returns {void}
   */
  deleteScript(id) {
    return this.delete("scripts", id);
  }

  /**
   * @method getScript
   * @description Retrieves a script from the database.
   * @param {string} id - The ID of the script to retrieve.
   * @returns {Script|null} The retrieved script or null if not found.
   */
  getScript(id) {
    const scripts = this.get("scripts");
    return scripts[id] || null;
  }

  /**
   * @method resetScripts
   * @description Resets the scripts collection to an empty state.
   * @returns {void}
   */
  resetScripts() {
    return this.reset("scripts");
  }
}

/**
 * @class User
 * @description Represents a user in the system.
 */
class User {
  /**
   * @constructor
   * @param {{}} userData - The user data.
   * @param {string} userData.id - The unique identifier for the user.
   * @param {string} userData.username - The username of the user.
   * @param {string} [userData.avatar] - The avatar of the user.
   * @param {Server[]} [userData.guilds] - The guilds of the user.
   * @param {boolean} [userData.isAdmin=false] - Whether the user is an admin.
   */
  constructor({
    id,
    username,
    isAdmin = false,
    avatar = null,
    guilds = [],
    token,
  }) {
    this.balance = 0;
    this.scriptBuyed = [];
    this.discord = {
      id,
      username,
      avatar,
      avatarUrl: `https://cdn.discordapp.com/avatars/${id}/${avatar}`,
    };
    this.id = id;
    this.isAdmin = isAdmin;
    this.token = token;
    /**
     * @type {Server[]}
     */
    this.guilds = guilds;
  }
}

/**
 * Represents a script in the system.
 */
class Script {
  /**
   * Create a new Script instance.
   * @param {Object} scriptData - The data for creating a new script.
   * @param {string} scriptData.id - The unique identifier for the script.
   * @param {string} scriptData.name - The name of the script.
   * @param {string} scriptData.description - A description of the script.
   * @param {string} scriptData.link - The link to the script.
   * @param {string} scriptData.author - The author of the script.
   * @param {string} scriptData.server - The server associated with the script.
   * @param {Object} [scriptData.price] - The price of the script.
   * @param {number} [scriptData.price.money=0] - The price in money.
   * @param {number} [scriptData.price.dl=0] - The price in DL (Diamond Locks).
   * @param {string} [scriptData.createdAt=new Date()] - The creation date of the script as a string.
   */
  constructor({
    id,
    name,
    description,
    link,
    price = { money: 0, dl: 0 },
    author,
    server,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.link = link;
    this.author = author;
    this.server = server;
    this.price = price;
    this.createdAt = createdAt;
  }
}

/**
 * Represents a server.
 */
class Server {
  /**
   * Creates a new Server instance.
   * @param {Object} params - The parameters for creating a server.
   * @param {string} params.id - The ID of the server.
   * @param {string} params.name - The name of the server.
   * @param {boolean} [params.owner=false] - Indicates if the current user is the owner of the server.
   * @param {string} [params.description="No Description"] - The description of the server.
   * @param {string} [params.last_updated] - The date when the server was last updated. Defaults to the current date.
   * @param {number} [params.rating=0] - The rating of the server.
   * @param {string} params.logo - The URL to the server's logo.
   */
  constructor({ id, name, owner, description, last_updated, rating, logo }) {
    /**
     * @type {string}
     */
    this.id = id;

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {boolean}
     */
    this.owner = owner || false;

    /**
     * @type {string}
     */
    this.description = description || "No Description";

    /**
     * @type {string}
     */
    this.lastUpdated =
      last_updated ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    /**
     * @type {number}
     */
    this.rating = rating || 0;

    /**
     * @type {string}
     */
    this.logo = logo;
  }
}

module.exports = { Database, User, Script, Server };
