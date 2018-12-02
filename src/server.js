import express from 'express';
import { Server } from 'http';
import SocketIO from 'socket.io';
import uuid from 'uuid/v4';
import u from 'updeep';

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
    fn(state);
  };

  io.on('connection', socket => {
    let id = uuid();
    let user = { id };
    const updateUser = (update, newId) => {
      if (newId) id = newId;
      user = { ...user, ...update, id: newId || id };
    };

    log(`user "${id}" connected`);
    updateState({ users: { [id]: user } });

    socket.on('client::init', (lsUser, fn) => {
      updateUser(lsUser, lsUser?.id);
      fn({ user, games: state.games });
    });

    socket.on('client::updateUser', (update, fn) => {
      updateUser(update);
      updateState({ users: { [id]: user } });
      fn(user);
    });

    socket.on(
      'client::newGame',
      ({ numberOfShips, shotsPerTurn, dimensions }) => {
        const game = {
          id: uuid(),
          host: id,
          hostName: user.name,
          numberOfShips,
          shotsPerTurn,
          dimensions
        };
        log('new game: ', game);
        updateState({ games: { [game.id]: game } }, state => {
          io.sockets.emit('server::games', state.games);
        });
      }
    );

    socket.on('disconnect', () => {
      log(`user "${id}" disconnected`);
    });
  });

  http.listen(port, () => {
    log(`listening on port ${port}`);
  });
};

export default main;
