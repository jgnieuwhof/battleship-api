import { pick } from 'lodash';

import acceptGame from './acceptGame';
import games from './games';
import joinRoom from './joinRoom';
import newGame from './newGame';
import updateUser from './updateUser';
import userInit from './userInit';
import gameEvent from './gameEvent';

import { gameEvent as gec } from '../common/constants';
import { publicView as pg } from '../model/game';

const sockets = {
  'client::acceptGame': acceptGame,
  'client::games': games,
  'client::joinRoom': joinRoom,
  'client::newGame': newGame,
  'client::userInit': userInit,
  'client::updateUser': updateUser,
  'client::gameEvent': gameEvent
};

const publicContentForEvent = ({ event }) => {
  switch (event.type) {
    case gec.placeShip:
      return [''];
    default:
      console.log(`ERROR: unknown event type "${event.type}"`);
      return [];
  }
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
          events.map(event => ({
            ...event,
            content:
              db.get('sockets', socketId).userId === event.userId
                ? event.content
                : pick(event, publicContentForEvent({ event }))
          }))
        )
      );
    },
    broadcastGame: ({ gameId, toRoom = true }) => {
      if (toRoom) {
        io.to(gameId).emit('server::game', db.get('games', gameId, pg));
      } else {
        socket.emit('server::game', db.get('games', gameId, pg));
      }
    },
    broadcastGames: () =>
      io.sockets.emit('server::games', db.getAll('games', pg))
  };
  Object.keys(sockets).forEach(event => {
    socket.on(event, sockets[event]({ io, socket, db, user, actions }));
  });
};

export default init;
