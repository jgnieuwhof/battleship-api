import u from 'updeep';
import { mapValues } from 'lodash';

const init = (initialState = {}) => {
  let state = initialState;

  state.get = (type, id, fn = x => x) => fn(state[type][id]);

  state.getAll = (type, fn = x => x) => mapValues(state[type], fn);

  state.updateScalar = (key, value) => (state[key] = value);

  state.update = (type, id, update) => {
    state[type] = u({ [id]: { ...update, id } }, state[type]);
    console.log(state);
  };

  state.remove = (type, id) => (state[type] = u(u.omit(id), state[type]));

  state.changeId = (type, id, newId) => {
    const oldObj = state.get(type, id);
    state.remove(type, id);
    state.update(type, newId, oldObj);
  };

  return state;
};

export default init;
