"use strict";
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.sqlite3');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users (info TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS metadata (info TEXT)");
});
db.close();
