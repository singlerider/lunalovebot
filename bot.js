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
let gamblelib = require("./gamble/gamble");
let gamble;
console.log(gamblelib.gambleExists);
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

bot.on("subanniversary", function(channel, username, months) {
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
      let amount = parseInt(donationAmount.replace(/[^\.0-9]+/g, ''));
      if (isNaN(amount)) {
        sendMessage(channel, user.username, "You gotta give me a number.");
        return;
      }
      let pointsToAdd = Math.abs(parseInt(amount / 5)) * 500;
      modifyPoints(userToAdd.replace("@", ""), pointsToAdd);
      sendMessage(channel, user.username, `${pointsToAdd} tokens to ${userToAdd} for the $${amount} donation!`);
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1; //January is 0!
      let yyyy = today.getFullYear();
      fs.appendFile(`logs/${yyyy}-${mm}-${dd}.txt`, `${user.username} added ${pointsToAdd} to ${userToAdd} at ${new Date()}` + '\n', function(err) {});
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

  if (splitMessage[0] == "!destroy") {
    let username = splitMessage[1];
    if (username == undefined) {
      sendMessage(chan, user.username, "You've got to include a user to timeout!");
      return;
    }
    new Promise(function(resolve, reject) {
      let points = getPoints(user.username);
      resolve(points);
    }).then(function(points) {
      console.log(points);
      if (points >= 100) {
        new Promise(function(resolve, reject) {
          resolve(modifyPoints(user.username, -100));
        }).then(function() {
          bot.timeout(chan, username, 30);
          sendMessage(chan, user.username, ` [${points} tokens ] just REKT ${username}.`);
        });
      } else {
        sendMessage(chan, user.username, "\'You trying to rip me off? Come back when you have more tokens");
      }
      return;
    });
  }

  if (splitMessage[0] == "!gamble") {
    if (gamblelib.gambleExists == true) {
      sendMessage(chan, user.username, "There's already one happening. Type \"!join\"");
      return;
    } else {
      console.log(1, gamblelib.gambleExists);
      let amount = splitMessage[1];
      if (parseInt(amount) == NaN || amount == undefined) {
        sendMessage(chan, user.username, "Bruh. Give me a number!");
        return;
      } else {
        console.log(amount);
        amount = Math.abs(parseInt(amount));
        console.log(amount);
      }
      new Promise((resolve, reject) => {
        let points = getPoints(user.username);
        resolve(points);
      }).then((points) => {
        if (points >= amount) {
          new Promise((resolve, reject) => {
            console.log(points, amount);
            resolve(modifyPoints(user.username, amount * -1));
          }).then(() => {
            console.log("RESOLVED");
            gamble = new gamblelib.Gamble(amount);
            gamblelib.gambleExists = true;
            gamble.addPlayer(user.username, amount);
            console.log(2, gamblelib.gambleExists);
            bot.say(chan, "/me " + user.username + ` created a new gamble with an entry price of ${amount}. 30 seconds remaining.`);
            setTimeout(() => {
              let winner = gamble.decideWinner();
              let pot = gamble.getPot();
              console.log(winner, pot, gamble.players);
              modifyPoints(winner, pot);
              gamblelib.gambleExists = false;
              gamble.kill();
              bot.say(chan, "/me " + winner + ` just won ${pot - amount} tokens!`)
            }, 30 * 1000);
          });
        } else {
          sendMessage(chan, user.username, "Dude. You can't gamble with something you don't have.");
        }
        return;
      });
    }
  }

  if (splitMessage[0] == "!join") {
    if (gamblelib.gambleExists != true) {
      sendMessage(chan, user.username, "There is no gamble right now. Type \"!gamble [amount]\"");
      return;
    } else {
      if (gamble.playerExists(user.username) == false) {
        new Promise((resolve, reject) => {
          let points = getPoints(user.username);
          resolve(points);
        }).then(function(points) {
          console.log(points);
          if (points >= gamble.betAmount) {
            new Promise((resolve, reject) => {
              resolve(modifyPoints(user.username, gamble.betAmount * -1));
            }).then(() => {
              gamble.addPlayer(user.username, points);
              bot.whisper(user.username, `There's no turning back now. ${gamble.betAmount} tokens have been debited from your account`);
            });
          } else {
            bot.whisper(user.username, "Learn to count.");
          }
          return;
        });
      } else {
        sendMessage(chan, user.username, "You can't join a gamble you're already in!");
      }
    }
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
