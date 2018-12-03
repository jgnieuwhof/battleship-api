const acceptGame = ({ db, user, actions }) => ({ gameId }) => {
  db.update('games', gameId, {
    opponent: user.id,
    opponentName: db.users[user.id].name
  });
  actions.broadcastGame({ gameId });
  actions.broadcastGames();
};

export default acceptGame;
