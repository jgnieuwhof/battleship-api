const userInit = ({ io, socket, db, user }) => (lsUser, fn) => {
  const { id, name, registered } = lsUser;
  if (id && id !== user.id) {
    db.changeId('users', user.id, id);
    db.update('sockets', socket.id, { userId: id });
    user.updateScalar('id', id);
  }
  db.update('users', user.id, {
    name,
    registered,
    socketId: socket.id
  });
  fn(db.get('users', user.id));
};

export default userInit;
