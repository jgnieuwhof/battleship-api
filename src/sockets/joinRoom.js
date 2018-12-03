const joinRoom = ({ db, socket, user }) => ({ gameId }, fn) => {
  if (db.users[user.id].room) socket.leave(db.users[user.id].room);
  socket.join(gameId);
  db.update('users', user.id, { room: gameId });
  fn(db.games[gameId]);
};

export default joinRoom;
