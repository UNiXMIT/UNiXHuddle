const express = require("express");
const { Pool } = require("pg");
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the PostgreSQL database.");
    createTable(client);
    createUsersTable(client);
    createTeamsTable(client);
  }
});

function createTable(client) {
  client.query(
    `CREATE TABLE IF NOT EXISTS huddledata (
        username TEXT NOT NULL,
        date DATE NOT NULL,
        userteam TEXT NOT NULL,
        capacity INTEGER,
        wellbeing INTEGER,
        upskilling INTEGER,
        knowledgetransfer INTEGER,
        goal1 TEXT,
        goal2 TEXT,
        goal3 TEXT,
        goal4 TEXT,
        goal5 TEXT,
        PRIMARY KEY (username, date, userteam)
    )`,
    (err, res) => {
      if (err) {
        console.error("Error creating Data table:", err.message);
      } else {
        console.log("Data Table created/connected successfully.");
      }
    }
  );
}

function createUsersTable(client) {
  client.query(
    `CREATE TABLE IF NOT EXISTS huddleusers (
        username TEXT NOT NULL,
        userteam TEXT NOT NULL,
        PRIMARY KEY (username, userteam)
    )`,
    (err, res) => {
      if (err) {
        console.error("Error creating Users table:", err.message);
      } else {
        console.log("Users Table created/connected successfully.");
      }
    }
  );
}

function createTeamsTable(client) {
  client.query(
    `CREATE TABLE IF NOT EXISTS huddleteams (
        userteam TEXT NOT NULL PRIMARY KEY,
        userteamname TEXT NOT NULL
    )`,
    (err, res) => {
      if (err) {
        console.error("Error creating Teams table:", err.message);
      } else {
        console.log("Teams Table created/connected successfully.");
      }
    }
  );
}

app.post("/submit", (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }
  const {
    username,
    date,
    userteam,
    capacity,
    wellbeing,
    upskilling,
    knowledgetransfer,
    goal1,
    goal2,
    goal3,
    goal4,
    goal5,
  } = req.body;
  pool.query(
    "INSERT INTO huddledata (username, date, userteam, capacity, wellbeing, upskilling, knowledgetransfer, goal1, goal2, goal3, goal4, goal5) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (username, date, userteam) DO UPDATE SET capacity = EXCLUDED.capacity, wellbeing = EXCLUDED.wellbeing, upskilling = EXCLUDED.upskilling, knowledgetransfer = EXCLUDED.knowledgetransfer, goal1 = EXCLUDED.goal1, goal2 = EXCLUDED.goal2, goal3 = EXCLUDED.goal3, goal4 = EXCLUDED.goal4, goal5 = EXCLUDED.goal5",
    [
      username,
      date,
      userteam,
      capacity,
      wellbeing,
      upskilling,
      knowledgetransfer,
      goal1,
      goal2,
      goal3,
      goal4,
      goal5,
    ],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error saving data");
      } else {
        res.sendStatus(200);
      }
    }
  );
});

app.get("/load", (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }
  const { username, date, userteam } = req.query;
  pool.query(
    "SELECT * FROM huddledata WHERE username = $1 AND date = $2 AND userteam = $3",
    [username, date, userteam],
    (err, result) => {
      if (err) {
        console.error(err.message);
        res.sendStatus(500);
      } else {
        if (result.rows.length > 0) {
          res.json(result.rows[0]);
        } else {
          res.sendStatus(204);
        }
      }
    }
  );
});

app.use("/teams", async (req, res) => {
  if (req.method === "GET") {
    pool.query(
      "SELECT * FROM huddleteams ORDER BY userteamname ASC",
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        } else {
          res.json(result.rows);
        }
      }
    );
  } else if (req.method === "POST") {
    const data = req.body;
    try {
      for (const obj of data) {
        await pool.query(
          "INSERT INTO huddleteams (userteam, userteamname) VALUES ($1, $2) ON CONFLICT (userteam) DO UPDATE SET userteamname = EXCLUDED.userteamname",
          [obj.userteam, obj.userteamname]
        );
      }
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send("Error adding team(s)");
    }
  } else if (req.method === "DELETE") {
    const data = req.body;
    try {
      for (const obj of data) {
        await pool.query("DELETE FROM huddleteams WHERE userteam = $1", [
          obj.userteam,
        ]);
      }
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send("Error deleting team(s)");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
});

app.use("/users", (req, res) => {
  if (req.method === "POST") {
    const { usernames, userteam } = req.body;
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res
        .status(400)
        .send("Invalid request format. Please provide an array of usernames.");
    }
    const placeholders = usernames
      .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(", ");
    const values = usernames.flatMap((name) => [name.trim(), userteam]);
    pool.query(
      `INSERT INTO huddleusers (username, userteam) VALUES ${placeholders} ON CONFLICT (username, userteam) DO NOTHING`,
      values,
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error adding user(s)");
        } else {
          res.sendStatus(200);
        }
      }
    );
  } else if (req.method === "DELETE") {
    const { usernames, userteam } = req.body;
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res
        .status(400)
        .send("Invalid request format. Please provide an array of usernames.");
    }
    const placeholders = usernames
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    pool.query(
      `DELETE FROM huddleusers WHERE username IN (${placeholders}) AND userteam = $${
        usernames.length + 1
      }`,
      [...usernames, userteam],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error deleting user(s)");
        } else {
          res.sendStatus(200);
        }
      }
    );
  } else if (req.method === "GET") {
    const { userteam } = req.query;
    pool.query(
      "SELECT * FROM huddleusers WHERE userteam = $1 ORDER BY username ASC",
      [userteam],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        } else {
          const usernames = result.rows.map((row) => row.username);
          res.json({ usernames: usernames });
        }
      }
    );
  } else {
    res.status(405).send("Method Not Allowed");
  }
});

app.use("/metrics", (req, res) => {
  if (req.method === "GET") {
    const { userteam, start, end } = req.query;
    pool.query(
      "SELECT * FROM huddledata WHERE userteam = $1 AND date BETWEEN $2 AND $3",
      [userteam, start, end],
      (err, result) => {
        if (err) {
          console.error(err.message);
          res.sendStatus(500);
        } else {
          if (result.rows.length > 0) {
            res.json(result.rows);
          } else {
            res.sendStatus(204);
          }
        }
      }
    );
  } else {
    res.status(405).send("Method Not Allowed");
  }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
