const joinRoom = ({ db, socket, user }) => ({ gameId }, fn) => {
  const dbUser = db.get('users', user.id);
  if (dbUser.room) socket.leave(dbUser.room);
  socket.join(gameId);
  db.update('users', user.id, { room: gameId });
  fn(db.get('games', gameId));
};

export default joinRoom;
