import express from 'express';
import { Server } from 'http';
import SocketIO from 'socket.io';
import uuid from 'uuid/v4';
import u from 'updeep';
import { mapValues, pick } from 'lodash';

import { port } from './config';
import initState from './state';
import initSocket from './sockets';

const { log } = console;

const main = () => {
  const app = express();
  const http = Server(app);
  const io = SocketIO(http);

  const db = initState({
    users: {},
    games: {}
  });

  io.on('connection', socket => {
    const user = initState({
      id: uuid()
    });

    log(`user "${user.id}" connected`);
    db.update('users', user.id, { id: user.id, socketId: socket.id });

    initSocket({ io, socket, db, user });

    socket.on('disconnect', () => {
      db.remove('users', user.id);
      log(`user "${user.id}" disconnected`);
    });
  });

  http.listen(port, () => {
    log(`listening on port ${port}`);
  });
};

export default main;
