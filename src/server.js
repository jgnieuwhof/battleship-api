import express from 'express';
import { Server } from 'http';
import SocketIO from 'socket.io';
import uuid from 'uuid/v4';
import u from 'updeep';
import { mapValues, pick } from 'lodash';

import { port } from './config';

const { log } = console;

const main = () => {
  const app = express();
  const http = Server(app);
  const io = SocketIO(http);

  let state = {
    users: {},
    games: {}
  };

  const updateState = (x, fn = () => {}) => {
    state = u(x, state);
    log(state);
    fn(state);
  };

  const updateGame = ({ gameId, update }) => {
    updateState({ games: { [gameId]: update } }, state => {
      const broadcastKeys = [
        'id',
        'host',
        'hostName',
        'opponent',
        'opponentName'
      ];
      if (Object.keys(update).some(k => broadcastKeys.includes(k))) {
        log('broadcast games');
        io.sockets.emit(
          'server::games',
          mapValues(state.games, g => pick(g, broadcastKeys))
        );
      }
    });
  };

  const broadcastGames = ({ state }) => {};

  io.on('connection', socket => {
    let id = uuid();

    const updateUser = (update, newId) => {
      if (newId && newId !== id) {
        updateState({ users: u.omit(id) });
        id = newId;
      }
      updateState({ users: { [id]: { ...update, id } } });
    };

    log(`user "${id}" connected`);
    updateState({ users: { [id]: { id } } });

    socket.on('client::init', (lsUser, fn) => {
      updateUser(lsUser, lsUser?.id);
      fn({ user: state.users[id], games: state.games });
    });

    socket.on('client::updateUser', (update, fn) => {
      updateUser(update);
      fn(state.users[id]);
    });

    socket.on(
      'client::newGame',
      ({ numberOfShips, shotsPerTurn, dimensions }) => {
        const gameId = uuid();
        const game = {
          id: gameId,
          host: id,
          hostName: state.users[id].name,
          numberOfShips,
          shotsPerTurn,
          dimensions
        };
        log('new game: ', game);
        updateGame({ gameId, update: game });
      }
    );

    socket.on('client::game', ({ gameId }, fn) => fn(state.games[gameId]));

    socket.on('client::joinGame', ({ gameId }) =>
      updateGame({
        gameId,
        update: { opponent: id, opponentName: state.users[id].name }
      })
    );

    socket.on('disconnect', () => {
      updateState({ users: u.omit(id) });
      log(`user "${id}" disconnected`);
    });
  });

  http.listen(port, () => {
    log(`listening on port ${port}`);
  });
};

export default main;
