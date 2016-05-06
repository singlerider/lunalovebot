"use strict";
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.sqlite3');

db.serialize(function() {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, points INT DEFAULT 0,
    autoban INTEGER DEFAULT 0);`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY,
    stream_id INTEGER DEFAULT 0);`
  );
});

exports.addUsers = function(usernames) {  // This is much simpler in Python
  let statement = `INSERT OR IGNORE INTO users(id, username)`;
  for (let username in usernames) {
    if (username == 0) {
      let amendment = ` SELECT NULL as id, ? as username`;
      statement += amendment;
    } else {
      let amendment = ` UNION SELECT NULL as id, ? as username`;
      statement += amendment;
    }
  }
  statement += ";";
  db.run(statement, usernames);
};

exports.addPointsBatch = function(usernames) {  // SUPER hack
  // console.log("USERS", usernames);
  for (let username of usernames) {
    // console.log("USERNAME", username);
    let statement = `
      INSERT OR REPLACE INTO users (id, username, points)
        VALUES (NULL, ?, (SELECT points FROM users WHERE username = ?) + 1);
    `;
    db.run(statement, [username, username]);
  }
  db.run("UPDATE users SET points = 0 WHERE points IS NULL;");
};

exports.addAutoban = function(username) {
  exports.addUsers([username]);
  db.run(`UPDATE users SET autoban = 1 WHERE username = ?`, username);
};

exports.getAutoBan = function(username) {
  let autoban = 0;
  return new Promise(function(resolve, reject) {
    db.each(`SELECT autoban FROM users WHERE username = ?`, username, function(err, row) {
        autoban = row.autoban;
        resolve(autoban);
    });
  });
}

exports.db = db;
