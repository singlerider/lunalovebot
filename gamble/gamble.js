"use strict";
class Gamble {
  constructor(betAmount) {
    this.betAmount = betAmount;
    this.isActive = true;
    this.players = new Map();
  }

  addPlayer(player, points) {
    if (!(player in this.players)) {
      this.players[player] = {
        points: points
      };
    }
  }

  playerExists(player) {
    if (player in this.players) {
      return this.players[player];
    } else {
      return false;
    }
  }

}

let gamble = new Gamble();
gamble.addPlayer("singlerider", 5);
console.log("singlerider EXISTS?", gamble.playerExists("singlerider"));
console.log("lunalovebot EXISTS?", gamble.playerExists("lunalovebot"));
