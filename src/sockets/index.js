import { pick } from 'lodash';

import acceptGame from './acceptGame';
import games from './games';
import joinRoom from './joinRoom';
import newGame from './newGame';
import updateUser from './updateUser';
import userInit from './userInit';
import gameEvent from './gameEvent';

import gameModel from '../model/game';
import eventModel from '../model/event';

const sockets = {
  'client::acceptGame': acceptGame,
  'client::games': games,
  'client::joinRoom': joinRoom,
  'client::newGame': newGame,
  'client::userInit': userInit,
  'client::updateUser': updateUser,
  'client::gameEvent': gameEvent
};

const socketsInRoom = ({ io, roomId }) =>
  new Promise(r => io.in(roomId).clients((e, x) => r(x)));

const init = ({ io, socket, db, user }) => {
  const actions = {
    broadcastEvent: async ({ gameId, event, toRoom = true }) => {
      const events = event ? [event] : db.get('games', gameId).events;
      const sockets = toRoom
        ? await socketsInRoom({ io, roomId: gameId })
        : [socket.id];
      sockets.forEach(socketId =>
        io.to(socketId).emit(
          'server::gameEvents',
          events.map(event =>
            eventModel.eventForUser({
              event,
              userId: db.get('sockets', socketId).userId
            })
          )
        )
      );
    },
    broadcastGame: ({ gameId, toRoom = true }) => {
      if (toRoom) {
        io.to(gameId).emit(
          'server::game',
          db.get('games', gameId, gameModel.pv)
        );
      } else {
        socket.emit('server::game', db.get('games', gameId, gameModel.pv));
      }
    },
    broadcastGames: () =>
      io.sockets.emit('server::games', db.getAll('games', gameModel.pv))
  };
  Object.keys(sockets).forEach(event => {
    socket.on(event, sockets[event]({ io, socket, db, user, actions }));
  });
};

export default init;
