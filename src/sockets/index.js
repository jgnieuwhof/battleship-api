import { pick, without } from 'lodash';
import u from 'updeep';

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

const socketsInGame = ({ io, gameId }) =>
  new Promise(r => io.in(gameId).clients((e, x) => r(x)));

const applicableSockets = ({ io, socket, gameId, toRoom }) =>
  toRoom ? socketsInGame({ io, gameId }) : [socket.id];

const init = ({ io, socket, db, user }) => {
  const actions = {
    broadcastEvent: async ({ gameId, event, toRoom = true }) => {
      const events = event ? [event] : db.get('games', gameId).events;
      (await applicableSockets({ io, socket, gameId, toRoom })).forEach(
        socketId =>
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
    broadcastGame: async ({ gameId, toRoom = true }) => {
      const game = db.get('games', gameId);
      (await applicableSockets({ io, socket, gameId, toRoom })).forEach(
        socketId => {
          const userId = db.get('sockets', socketId).userId;
          const notMyBoard = without(Object.keys(game.boards || {}), userId);
          io.to(socketId).emit(
            'server::game',
            u(
              {
                boards: notMyBoard.reduce(
                  (obj, id) => ({ ...obj, [id]: u.omit('ships') }),
                  {}
                )
              },
              game
            )
          );
        }
      );
    },
    broadcastGames: () =>
      io.sockets.emit('server::games', db.getAll('games', gameModel.pv))
  };
  Object.keys(sockets).forEach(event => {
    socket.on(event, sockets[event]({ io, socket, db, user, actions }));
  });
};

export default init;
