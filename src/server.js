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
    users: {}
  };
  const updateState = x => u(x, state);

  io.on('connection', socket => {
    const id = uuid();
    let currentUser = { id };

    log(`user "${id}" connected`);
    updateState({ users: { [id]: currentUser } });

    socket.on('client::init', (_, fn) => fn(currentUser));

    socket.on('client::updateUser', (update, fn) => {
      currentUser = { ...currentUser, ...update, id };
      updateState({ users: { [id]: currentUser } });
      fn(currentUser);
    });

    socket.on('disconnect', () => {
      log(`user "${id}" disconnected`);
    });
  });

  http.listen(port, () => {
    log(`listening on port ${port}`);
  });
};

export default main;
