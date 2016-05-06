"use strict";

let CronJob = require('cron').CronJob;
let request = require('request');
let addPointsBatch = require("./db").addPointsBatch;
let getUserPoints = require("./db").getUserPoints;
let getLeaderboard = require("./db").getLeaderboard;

function parseUsers(userDict) {
  let allUsers = [];
  for (let userType in userDict.chatters) {
    for (let user of userDict.chatters[userType]) {
      allUsers.push(user);
    }
  }
  return allUsers;
}

exports.getPoints = function(username) {
  return getUserPoints(username);
}

exports.leaderboard = function() {
  return new Promise(function(resolve, reject) {
    resolve(getLeaderboard());
  }).then(function(results) {
    let stringReturn = "The top 10 token Ds are: "
    let leaders = [];
    for (let leader in results) {
      if (!isNaN(parseInt(leader))) {
        leaders.push(`${parseInt(leader) + 1})${results[leader].username} ${results[leader].points}`);
      }
    }
    leaders = leaders.join("|");
    return stringReturn + leaders;
  });
}

exports.pointsCron = function(channel) {
  let offset = parseInt(Math.random() * 60);
  let pattern = `${offset} */5 * * * *`;
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
