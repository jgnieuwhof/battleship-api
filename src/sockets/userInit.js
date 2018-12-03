const userInit = ({ io, socket, db, user }) => (lsUser, fn) => {
  if (lsUser?.id && lsUser.id !== user.id) {
    db.remove('users', user.id);
    user.updateScalar('id', lsUser.id);
  }
  db.update('users', user.id, lsUser);
  fn(db.users[user.id]);
};

export default userInit;
