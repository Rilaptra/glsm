const { default: axios } = require("axios");
const { Database, User, Server } = require("../../classes.js");
const url = require("url");
require("dotenv").config();

/**
 *
 * @param {{code: string}} data
 * @param {Database} db
 * @param {Function} callback
 *
 * @callback callback
 * @param {Error} [err]
 * @param {any} [result]
 */
module.exports = async (data, db, callback) => {
  const { code } = data;

  if (!code) return callback(new Error("Code not found!"));
  const formData = new url.URLSearchParams({
    client_id: process.env.ClientID,
    client_secret: process.env.ClientSecret,
    code: code.toString(),
    grant_type: "authorization_code",
    redirect_uri: "https://5b88-47-253-82-249.ngrok-free.app/api/discord/auth",
  });

  try {
    const dataFetch = (
      await axios.post("https://discord.com/api/v10/oauth2/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    ).data;

    const { access_token, expires_in } = dataFetch;

    try {
      const { id, username, avatar } = (
        await axios.get("https://discord.com/api/v10/users/@me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
      ).data;

      const guildsData = (
        await axios.get("https://discord.com/api/v10/users/@me/guilds", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
      ).data;

      const guildSaved = guildsData.filter((guild) => db.getServer(guild.id));

      const guilds = guildSaved.map(
        (guild) =>
          new Server({
            id: guild.id,
            name: guild.name,
            logo: guild.icon,
            owner: guild.owner,
          })
      );

      // Create User component
      const user = new User({
        id,
        username,
        avatar,
        guilds,
        token: access_token,
      });

      const admin = user.guilds.find((guild) => guild.owner);

      if (!db.getUser(user.id)) {
        if (admin) {
          user.isAdmin = true;
        }
        db.addUser(user);
      } else if (db.getUser(user.id)) {
        const userRegistered = db.getUser(user.id);
        userRegistered.token = access_token;
        userRegistered.discord = user.discord;
        if (admin) {
          userRegistered.isAdmin = true;
        }
        db.updateUser(userRegistered.id, userRegistered);
      }

      /**
       * @type {Response}
       */
      const option = {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": `token=${access_token}; Expires=${new Date(
            Date.now() + expires_in
          ).toUTCString()}; Max-Age=${expires_in / 1000}; HttpOnly; Path=/;`,
          "Access-Control-Expose-Headers": "Set-Cookie",
        },
      };

      callback(null, { ...user, ...option });
    } catch (err) {
      console.log(err);
      callback(new Error(err));
      return;
    }
  } catch (error) {
    callback(new Error("Invalid code request"));
  }
};
