"use strict";

let gambleExists = false;

class Gamble {
  constructor(betAmount) {
    this.betAmount = betAmount;
    this.isActive = true;
    this.players = new Map();
    console.log(3, gambleExists);
  }

  getPot() {
    console.log("OBJECT KEYS LENGTH", Object.keys(this.players).length);
    console.log("BET AMOUNT", this.betAmount);
    console.log(Object.keys(this.players).length * this.betAmount);
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
    console.log(4, gambleExists);
    this.players = new Map();
  }

  decideWinner() {
    let keys = Object.keys(this.players);
    console.log("KEYS", keys);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  playerExists(player) {
    if (player in this.players) {
      return this.players[player];
    } else {
      return false;
    }
  }
}

exports.gambleExists = gambleExists;
exports.Gamble = Gamble;
