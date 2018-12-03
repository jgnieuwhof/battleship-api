import u from 'updeep';

let state = {
  users: {},
  games: {}
};

export const updateState = x => {
  state = u(x, state);
  console.log(state);
};

export const updateUser = (id, user) => {
  state.users = u({ [id]: { ...user, id } }, state.users);
};

export const removeUser = id => {
  state.users = u(u.omit(id), state.users);
};

export const updateGame = (id, game) => {
  state.games = u({ [id]: { ...game, id } }, state.games);
};

export const removeGame = id => {
  state.games = u(u.omit(id), state.users);
};

export default state;
