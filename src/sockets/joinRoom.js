const joinRoom = ({ db, socket, user, actions }) => ({ gameId }, fn) => {
  const dbUser = db.get('users', user.id);
  if (dbUser.room) socket.leave(dbUser.room);
  if (db.get('games', gameId)) {
    socket.join(gameId);
    db.update('users', user.id, { room: gameId });
    actions.broadcastGame({ gameId, toRoom: false });
    actions.broadcastEvent({ gameId, toRoom: false });
  }
};

export default joinRoom;
