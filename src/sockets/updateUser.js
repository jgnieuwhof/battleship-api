const updateUser = ({ db, user }) => (update, fn) => {
  db.update('users', user.id, update);
  fn(db.get('users', user.id));
};

export default updateUser;
