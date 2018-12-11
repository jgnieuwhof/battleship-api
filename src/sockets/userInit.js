const userInit = ({ io, socket, db, user }) => (lsUser, fn) => {
  if (lsUser?.id && lsUser.id !== user.id) {
    db.changeId('users', user.id, lsUser.id);
    db.update('sockets', user.socketId, { userId: lsUser.id });
    user.updateScalar('id', lsUser.id);
  }
  db.update('users', user.id, lsUser);
  fn(db.get('users', user.id));
};

export default userInit;
