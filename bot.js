"use strict";
let irc = require("./libs/irc");
let bot = irc.bot;
const PREFIX = "!";
const PRIMARY_CHANNEL = irc.PRIMARY_CHANNEL;
const SUPERUSER = irc.SUPERUSER;
let addAutoban = require("./libs/db").addAutoban;
let getAutoBan = require("./libs/db").getAutoBan;
let addUsers = require("./libs/db").addUsers;
let pointsCron = require("./libs/points").pointsCron;
let getPoints = require("./libs/points").getPoints;
let leaderboard = require("./libs/points").leaderboard;

function sendMessage(channel, username, message) {
  let intro = `\<${username}\> `;
  bot.say(channel, intro + message);
}

bot.connect().then(function(data) {
  pointsCron(PRIMARY_CHANNEL.replace("#", ""));
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
        return;
      }
    });
  }

  if (message.toLowerCase() == "!tokens") {
    new Promise(function(resolve, reject) {
      let points = getPoints(user.username);
      resolve(points);
    }).then(function(points) {
      sendMessage(chan, user.username, `You've got ${points} tokens!`);
      return;
    });
  }

  if (message.toLowerCase() == "!leaderboard" && user.mod == true) {
    new Promise(function(resolve, reject) {
      resolve(leaderboard());
    }).then(function(results) {
      console.log(results);
      sendMessage(chan, user.username, results);
      return;
    });
  }

  if (user.username == chan || user.username == SUPERUSER) {
    message = message.toLowerCase().split(" ");
    if (message[0].replace(PREFIX, "") == "autoban") {
      addAutoban(message[1]);
      return;
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
