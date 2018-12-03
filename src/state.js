import u from 'updeep';
import { mapValues, pick } from 'lodash';

const init = (initialState = {}) => {
  let state = initialState;

  state.updateScalar = (key, value) => (state[key] = value);

  state.update = (type, id, update) => {
    state[type] = u({ [id]: { ...update, id } }, state[type]);
    console.log(state);
  };

  state.configView = (type, viewName, keys) => {
    state[`${viewName}Keys`] = keys;
    state[viewName] = () => mapValues(state[type], x => pick(x, keys));
  };

  state.remove = (type, id) => (state[type] = u(u.omit(id), state[type]));

  return state;
};

export default init;
