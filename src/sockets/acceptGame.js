import { gameStates } from '../common/constants';

const acceptGame = ({ db, user, actions }) => ({ gameId }) => {
  const game = db.get('games', gameId);
  db.update('games', gameId, {
    boards: {
      [game.host]: {},
      [game.opponent]: {}
    },
    state: gameStates.setup,
    opponent: user.id,
    opponentName: db.get('users', user.id).name
  });
  actions.broadcastGame({ gameId });
  actions.broadcastGames();
};

export default acceptGame;
