import uuid from 'uuid/v4';

import { gameStates } from '../common/constants';

const newGame = ({ io, db, user, actions }) => (
  { numberOfShips, shotsPerTurn, dimensions },
  fn
) => {
  const gameId = uuid();
  const game = {
    id: gameId,
    state: gameStates.matchmaking,
    host: user.id,
    hostName: db.get('users', user.id).name,
    numberOfShips,
    shotsPerTurn,
    dimensions,
    events: [],
    boards: {}
  };
  db.update('games', gameId, game);
  actions.broadcastGames();
  fn({ id: gameId });
};

export default newGame;
