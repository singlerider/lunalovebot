"use strict";
let irc = require("./libs/irc");
let bot = irc.bot;
const PREFIX = "!";
const PRIMARY_CHANNEL = irc.PRIMARY_CHANNEL;
const SUPERUSER = irc.SUPERUSER;
let addAutoban = require("./libs/db").addAutoban;
let getAutoBan = require("./libs/db").getAutoBan;
let addUsers = require("./libs/db").addUsers;

bot.connect().then(function(data) {
  // TODO start points timer from here
}).catch(function(err) {
  //
});

bot.on("chat", function(channel, user, message, self) {
  let chan = channel.replace("#", "");

  if (user.username != SUPERUSER && user.username != chan) {
    new Promise(function(resolve, reject) {
      let autoban = getAutoBan(user.username);
      resolve(autoban);
    }).then(function(autoban) {
      if (autoban == 1) {
        bot.say(channel, `/ban ${user.username}`);
      }
    });
  }

  if (user.username == chan || user.username == SUPERUSER) {
    message = message.toLowerCase().split(" ");
    if (message[0].replace(PREFIX, "") == "autoban") {
      addAutoban(message[1]);
    }
  }

});

bot.on("whisper", function(user, message) {
  if (user.username == PRIMARY_CHANNEL.replace("#", "") || user.username == SUPERUSER) {
    message = message.toLowerCase().split(" ");
    if (message[0].replace(PREFIX, "") == "autoban") {
      addAutoban(message[1]);
    }
  }
});

bot.on("timeout", function(channel, username) {
  console.log(channel, username, new Date());
});

bot.on("notice", function(channel, msgid, message) {
  console.log(channel, msgid, message);
});