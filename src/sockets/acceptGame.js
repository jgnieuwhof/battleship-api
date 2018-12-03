const acceptGame = ({ db, user, actions }) => ({ gameId }) => {
  db.update('games', gameId, {
    state: 'setup',
    opponent: user.id,
    opponentName: db.get('users', user.id).name
  });
  actions.broadcastGame({ gameId });
  actions.broadcastGames();
};

export default acceptGame;
