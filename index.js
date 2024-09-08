const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const cookie = require("cookie");
const { Database } = require("./classes.js");

const PORT = 80;

// https://cff8-47-253-197-141.ngrok-free.app

// RDP Erzy
// https://5b88-47-253-82-249.ngrok-free.app

const db = new Database("./db.json");

const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

const callApiHandler = (apiHandler, data, db, res) => {
  apiHandler(data, db, (err, result) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
      console.log(err);
    } else {
      res.writeHead(result.status || 200, {
        "Content-Type": "application/json",
        ...result.headers,
      });
      res.end(JSON.stringify(result));
    }
  });
};

const server = http.createServer((req, res) => {
  if (!req.url.startsWith("/api/")) {
    // Serve static files from ./public
    const filePath = path.join(__dirname, "public", req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404);
          res.end("404 Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fs.readFileSync("./public/byClaude.html"));
        }
      } else {
        const ext = path.extname(filePath);
        let contentType = "text/html";

        switch (ext) {
          case ".js":
            contentType = "text/javascript";
            break;
          case ".css":
            contentType = "text/css";
            break;
          case ".json":
            contentType = "application/json";
            break;
          case ".png":
            contentType = "image/png";
            break;
          case ".jpg":
            contentType = "image/jpeg";
            break;
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  } else {
    const parsedUrl = url.parse(req.url, true);
    const parts = parsedUrl.pathname.split("/").filter(Boolean);

    if (parts.length >= 2 && parts[0] === "api") {
      const apiPath = parts.slice(1).join("/");

      try {
        const apiHandler = require(`./api/${apiPath}.js`);
        let data = {};

        // Check if the last part is base64 encoded JSON
        const lastPart = parts[parts.length - 1];
        if (lastPart.match(/^[A-Za-z0-9+/=]+$/)) {
          try {
            data = JSON.parse(Buffer.from(lastPart, "base64").toString());
          } catch (e) {
            // If parsing fails, assume it's not base64 JSON
            data = parsedUrl.query;
          }
        } else {
          data = parsedUrl.query;
        }

        data.cookie = cookie.parse(req.headers.cookie || "");
        data.req = req;

        if (req.method !== "GET") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            try {
              data.body = JSON.parse(body);
            } catch (e) {
              data.body = body;
            }

            callApiHandler(apiHandler, data, db, res);
          });
        } else {
          callApiHandler(apiHandler, data, db, res);
        }
      } catch (error) {
        console.log(error);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "API endpoint not found" }));
      }
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
