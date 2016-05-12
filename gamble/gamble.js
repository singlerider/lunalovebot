"use strict";

let gambleExists = false;

class Gamble {
  constructor(betAmount) {
    this.betAmount = betAmount;
    this.isActive = true;
    this.players = new Map();
    setTimeout(() => {
      this.kill();
    }, 10 * 1000);
  }

  getPot() {
    return Object.keys(this.players).length * this.betAmount;
  }

  checkBetAmount(amount) {
    if (amount != this.betAmount) {
      return false;
    } else {
      return true;
    }
  }

  addPlayer(player, points) {
    if (!(player in this.players)) {
      this.players[player] = {
        points: points
      };
    } else {
      return false;
    }
  }

  kill() {
    this.players = new Map();
    gambleExists = false;
  }

  playerExists(player) {
    if (player in this.players) {
      return this.players[player];
    } else {
      return false;
    }
  }
}

let gamble = new Gamble(5);
gambleExists = true;

function checkExists() {
  console.log("singlerider EXISTS?", gamble.playerExists("singlerider"));
  console.log("lunalovebot EXISTS?", gamble.playerExists("lunalovebot"));
}

gamble.addPlayer("singlerider", 5);
console.log(gamble.betAmount);
console.log(gamble.checkBetAmount(5));
console.log(gamble.checkBetAmount(10));
console.log("POT:", gamble.getPot());
checkExists();


exports.gambleExists = gambleExists;
exports.Gamble = Gamble;
