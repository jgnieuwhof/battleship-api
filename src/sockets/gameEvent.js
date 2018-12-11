import uuid from 'uuid/v4';
import u from 'updeep';

const gameEvent = ({ db, user, actions }) => ({ gameId, type, content }) => {
  const event = {
    id: uuid(),
    time: Date.now(),
    userId: user.id,
    type,
    content
  };
  db.update('games', gameId, { events: x => [...x, event] });
  actions.broadcastEvent({ gameId, event });
};

export default gameEvent;
