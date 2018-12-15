import uuid from 'uuid/v4';

import { gameStates } from '../common/constants';

const newGame = ({ io, db, user, actions }) => ({ dimensions }, fn) => {
  const gameId = uuid();
  const game = {
    id: gameId,
    state: gameStates.matchmaking,
    host: user.id,
    hostName: db.get('users', user.id).name,
    dimensions,
    events: [],
    boards: {}
  };
  db.update('games', gameId, game);
  actions.broadcastGames();
  fn({ id: gameId });
};

export default newGame;
