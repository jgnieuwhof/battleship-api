import uuid from 'uuid/v4';

import { publicView as pg } from '../model/game';

const newGame = ({ io, db, user, actions }) => (
  { numberOfShips, shotsPerTurn, dimensions },
  fn
) => {
  const gameId = uuid();
  const game = {
    id: gameId,
    state: 'matchmaking',
    host: user.id,
    hostName: db.get('users', user.id).name,
    numberOfShips,
    shotsPerTurn,
    dimensions,
    events: []
  };
  db.update('games', gameId, game);
  actions.broadcastGames();
  fn({ id: gameId });
};

export default newGame;
