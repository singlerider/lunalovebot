"use strict";
let irc = require("./libs/irc");
let bot = irc.bot;

bot.connect().then(function(data) {
  // TODO start points timer from here
}).catch(function(err) {
  //
});

bot.on("chat", function(channel, user, message, self) {
  let chan = channel.replace("#", "");
  console.log(chan, user, message);
});
