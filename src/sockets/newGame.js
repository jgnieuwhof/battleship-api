import uuid from 'uuid/v4';

const newGame = ({ io, db, user, actions }) => (
  { numberOfShips, shotsPerTurn, dimensions },
  fn
) => {
  const gameId = uuid();
  const game = {
    id: gameId,
    host: user.id,
    hostName: db.get('users', user.id).name,
    numberOfShips,
    shotsPerTurn,
    dimensions
  };
  db.update('games', gameId, game);
  actions.broadcastGames();
  fn(game);
};

export default newGame;
