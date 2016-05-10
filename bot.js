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
let modifyPoints = require("./libs/db").modifyPoints;
let fs = require('fs');

function sendMessage(channel, username, message) {
  let intro = `@${username} `;
  bot.say(channel, intro + message);
}

bot.connect().then(function(data) {
  pointsCron(PRIMARY_CHANNEL.replace("#", ""));
}).catch(function(err) {
  //
});

bot.on("subanniversary", function (channel, username, months) {
    let chan = channel.replace("#", "");
    let pointsToAdd = parseInt(months) * 100;
    if (pointsToAdd > 1000) {
      pointsToAdd = 1000;
    }
    modifyPoints(username, pointsToAdd);
    let plural = "months";
    if (months < 2) {
      plural = month;
    }
    bot.say(chan, `/me ${username} gets ${pointsToAdd} tokens for ${months} ${plural}!`);
});

bot.on("chat", function(channel, user, message, self) {
  let chan = channel.replace("#", "");
  let splitMessage = message.toLowerCase().split(' ');

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

  if (splitMessage[0] == "!tokens") {
    new Promise(function(resolve, reject) {
      let points = getPoints(user.username);
      resolve(points);
    }).then(function(points) {
      sendMessage(chan, user.username, `You've got ${points} tokens!`);
      return;
    });
  }

  if (splitMessage[0] == "!donation" && user.username == chan) {
    let userToAdd = splitMessage[1];
    let donationAmount = splitMessage[2];
    if (userToAdd != undefined && donationAmount != undefined) {
      let amount = parseInt(donationAmount.replace(/[^\.0-9]+/g,''));
      if (isNaN(amount)) {
       sendMessage(channel, user.username, "You gotta give me a number.");
       return;
      }
      let pointsToAdd = Math.abs(parseInt(amount / 5)) * 500;
      modifyPoints(userToAdd.replace("@", ""), pointsToAdd);
      sendMessage(channel, user.username, `${pointsToAdd} tokens to ${userToAdd} for the $${amount} donation!`);
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth()+1; //January is 0!
      let yyyy = today.getFullYear();
      fs.appendFile(`logs/${yyyy}-${mm}-${dd}.txt`, `${user.username} added ${pointsToAdd} to ${userToAdd} at ${new Date()}` + '\n', function (err) {});
      return;
    } else {
      sendMessage(channel, user.username, "cmonBruh - it's \"!donation USERNAME AMOUNT\"");
      return;
    }
  }

  if (splitMessage[0] == "!leaderboard" && user.mod == true) {
    new Promise(function(resolve, reject) {
      resolve(leaderboard());
    }).then(function(results) {
      console.log(results);
      sendMessage(chan, user.username, results);
      return;
    });
  }

  if (user.username == chan || user.username == SUPERUSER) {
    if (splitMessage[0].replace(PREFIX, "") == "autoban") {
      addAutoban(splitMessage[1]);
      return;
    }
  }

});

bot.on("whisper", function(user, message) {
  if (user.username == PRIMARY_CHANNEL.replace("#", "") || user.username == SUPERUSER) {
    if (splitMessage[0].replace(PREFIX, "") == "autoban") {
      addAutoban(splitMessage[1]);
    }
  }
});

bot.on("timeout", function(channel, username) {
  console.log(channel, username, new Date());
});

bot.on("notice", function(channel, msgid, message) {
  console.log(channel, msgid, message);
});
