import express from 'express';
import { Server } from 'http';
import SocketIO from 'socket.io';
import uuid from 'uuid/v4';
import u from 'updeep';
import { mapValues, pick } from 'lodash';

import { port } from './config';
import state, { updateUser, removeUser, updateGame } from './state';

const { log } = console;

const main = () => {
  const app = express();
  const http = Server(app);
  const io = SocketIO(http);

  const gamesKeys = ['id', 'host', 'hostName', 'opponent', 'opponentName'];
  const getGames = () => mapValues(state.games, g => pick(g, gamesKeys));
  const broadcastGames = () => io.sockets.emit('server::games', getGames());

  io.on('connection', socket => {
    let id = uuid();

    const broadcastGame = gameId => {
      socket.to(gameId).emit('server::game', state.games[gameId]);
      socket.emit('server::game', state.games[gameId]);
    };

    log(`user "${id}" connected`);
    updateUser(id, { id });

    socket.on('client::init', (lsUser, fn) => {
      if (lsUser?.id && lsUser.id !== id) {
        removeUser(id);
        id = lsUser.id;
      }
      updateUser(id, lsUser);
      fn(state.users[id]);
    });

    socket.on('client::updateUser', (update, fn) => {
      updateUser(id, update);
      fn(state.users[id]);
    });

    socket.on(
      'client::newGame',
      ({ numberOfShips, shotsPerTurn, dimensions }, fn) => {
        const gameId = uuid();
        const game = {
          id: gameId,
          host: id,
          hostName: state.users[id].name,
          numberOfShips,
          shotsPerTurn,
          dimensions
        };
        updateGame(gameId, game);
        broadcastGames();
        fn(game);
      }
    );

    socket.on('client::games', (_, fn) => fn(getGames()));

    socket.on('client::joinRoom', ({ gameId }, fn) => {
      if (state.users[id].room) socket.leave(state.users[id].room);
      socket.join(gameId);
      updateUser(id, { room: gameId });
      fn(state.games[gameId]);
    });

    socket.on('client::acceptGame', ({ gameId }) => {
      updateGame(gameId, { opponent: id, opponentName: state.users[id].name });
      broadcastGame(gameId);
      broadcastGames();
    });

    socket.on('disconnect', () => {
      removeUser(id);
      log(`user "${id}" disconnected`);
    });
  });

  http.listen(port, () => {
    log(`listening on port ${port}`);
  });
};

export default main;
