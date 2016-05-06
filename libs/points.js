"use strict";

let CronJob = require('cron').CronJob;
let request = require('request');
let addPointsBatch = require("./db").addPointsBatch;

function parseUsers(userDict) {
  let allUsers = [];
  for (let userType in userDict.chatters) {
    for (let user of userDict.chatters[userType]) {
      allUsers.push(user);
    }
  }
  return allUsers;
}

exports.pointsCron = function(channel) {
  let offset = parseInt(Math.random() * 60);
  let pattern = `${offset} */1 * * * *`;
  let job = new CronJob(pattern, function() {
      // PROMISE - ONLY RUN JOB WHEN ONLINE
      new Promise(function(resolve, reject) {
        request({
          url: `https://api.twitch.tv/kraken/streams/${channel}`,
          method: "GET",
          json: true
        }, function(error, response, body) {
          resolve(body);
        });
      }).then(function(body) {
        if (body.stream != null) {
          new Promise(function(resolve, reject) {
            request({
              url: `https://tmi.twitch.tv/group/user/${channel}/chatters`,
              method: "GET",
              json: true
            }, function(error, response, body) {
              let allUsers = parseUsers(body);
              resolve(allUsers);
            });
          }).then(function(allUsers) {
            addPointsBatch(allUsers);
          });
        }
      });
    },
    true,
    "America/Los_Angeles"
  );
}
