import firebase from "firebase";
import { config } from "./dbconfig";
import PubSub from "pubsub-js";
export class api {
  // @required subscribe:
  //1.newWaitingGames -> waiting games list.
  constructor() {
    firebase.initializeApp(config);
    this.database = firebase.database();
  }
  createNewWaitingGame(gameName, token) {
    return new Promise((res, rej) =>
      fetch(
        "https://us-central1-quoridor-swe681.cloudfunctions.net/api/creategame",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            gameName
          })
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? Promise.reject(payload.err) : payload))
        .then(payload => res(payload.gameId))
        .catch(err => rej(err))
    );
  }

  getLeaderBoard(token) {
    return new Promise((res, rej) =>
      fetch(
        `https://us-central1-quoridor-swe681.cloudfunctions.net/api/leaderboard?token=${
          token
        }`,
        {
          method: "GET"
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? Promise.reject() : payload))
        .then(players => res(players))
        .catch(err => rej(err))
    );
  }

  joinExistingGame(gameId, token) {
    return new Promise((res, rej) =>
      fetch(
        "https://us-central1-quoridor-swe681.cloudfunctions.net/api/joingame",
        {
          method: "put",
          body: JSON.stringify({
            token,
            gameId
          })
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? rej(payload.err) : payload))
        .then(gameId => res(gameId))
        .catch(err => {
          throw new Error(err);
        })
    );
  }
  leaveGame(gameId, token) {
    return new Promise((res, rej) =>
      fetch(
        "https://us-central1-quoridor-swe681.cloudfunctions.net/api/leavegame",
        {
          method: "put",
          body: JSON.stringify({
            token,
            gameId
          })
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? Promise.reject(payload.err) : payload))
        .then(gameId => res(gameId))
        .catch(err => rej(err))
    );
  }
  setMove(gameId, token) {
    return new Promise((res, rej) =>
      fetch(
        "https://us-central1-quoridor-swe681.cloudfunctions.net/api/setmove",
        {
          method: "put",
          body: JSON.stringify({
            token,
            gameId
          })
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? Promise.reject(payload.err) : payload))
        .then(gameId => res(gameId))
        .catch(err => rej(err))
    );
  }
  timeout(token, gameId){
    return new Promise((res, rej) =>
    fetch(
      " https://us-central1-quoridor-swe681.cloudfunctions.net/api/timeout",
      {
        method: "put",
        body: JSON.stringify({
          token,
          gameId
        })
      }
    )
      .then(payload => payload.json())
      .then(payload => (payload.err ? Promise.reject(payload.err) : payload))
      .then(gameId => res(gameId))
      .catch(err => rej(err))
  );
  }
  getPlayerProfile(token) {
    return new Promise((res, rej) =>
      fetch(
        `https://us-central1-quoridor-swe681.cloudfunctions.net/api/getPlayerProfile?token=${
          token
        }`,
        {
          method: "GET"
        }
      )
        .then(payload => payload.json())
        .then(payload => (payload.err ? Promise.reject() : payload))
        .then(players => res(players))
        .catch(err => rej(err))
    );
  }
  //@scope:private
  newWaitingGameSubscription() {
    this.database
      .ref("waitingGames")
      .on("value", snapshot => this.publish("newWaitingGames", snapshot.val()));
  }
  GameSubscription(gameId) {
    this.database
      .ref(`games/${gameId}/public`)
      .on("value", snapshot => this.publish("gameChange", snapshot.val()));
  }
  cancelGamesSubscription(gameId) {
    this.database.ref(`games/${gameId}/public`).off();
  }
  //@scope:private
  cancelWaitingGamesSubscription() {
    this.database.ref("waitingGames").off();
  }
  publish(message, data) {
    PubSub.publish(message, data);
  }
}
