"use strict";
let irc = require("tmi.js");
let config = require("../config/config");
const SUPERUSER = config.superuser;
const PRIMARY_CHANNEL = config.channels[0];

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
exports.SUPERUSER = SUPERUSER;
exports.PRIMARY_CHANNEL = PRIMARY_CHANNEL;
