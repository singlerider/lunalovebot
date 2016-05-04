"use strict";
let irc = require("tmi.js");
let config = require("../config/config");

let options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: config.username,
        password: config.password
    },
    channels: config.channels
};

let bot = new irc.client(options);

exports.bot = bot;
