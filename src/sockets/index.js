import acceptGame from './acceptGame';
import games from './games';
import joinRoom from './joinRoom';
import newGame from './newGame';
import updateUser from './updateUser';
import userInit from './userInit';

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
      socket.to(gameId).emit('server::game', db.games[gameId]);
      socket.emit('server::game', db.games[gameId]);
    },
    broadcastGames: () => io.sockets.emit('server::games', db.gamesSummary())
  };
  Object.keys(sockets).forEach(event => {
    socket.on(event, sockets[event]({ io, socket, db, user, actions }));
  });
};

export default init;
