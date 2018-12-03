import acceptGame from './acceptGame';
import games from './games';
import joinRoom from './joinRoom';
import newGame from './newGame';
import updateUser from './updateUser';
import userInit from './userInit';

import { publicView as pg } from '../model/game';

const sockets = {
  'client::acceptGame': acceptGame,
  'client::games': games,
  'client::joinRoom': joinRoom,
  'client::newGame': newGame,
  'client::userInit': userInit,
  'client::updateUser': updateUser
};

const init = ({ io, socket, db, user }) => {
  const actions = {
    broadcastGame: ({ gameId }) => {
      socket.to(gameId).emit('server::game', db.get('games', gameId, pg));
      socket.emit('server::game', db.get('games', gameId, pg));
    },
    broadcastGames: () =>
      io.sockets.emit('server::games', db.getAll('games', pg))
  };
  Object.keys(sockets).forEach(event => {
    socket.on(event, sockets[event]({ io, socket, db, user, actions }));
  });
};

export default init;
