import uuid from 'uuid/v4';
import u from 'updeep';

import { gameEvent as gameEventConstants } from '../common/constants';

const gameUpdateFromEvent = ({ event }) => {
  switch (event.type) {
    case gameEventConstants.placeShip:
      const { x, y, rotation, id, length } = event.content;
      return {
        boards: {
          [event.userId]: {
            ships: ships => [...(ships || []), { x, y, rotation, id, length }]
          }
        }
      };
      break;
  }
  return {};
};

const gameEvent = ({ db, user, actions }) => ({ gameId, type, content }) => {
  const game = db.get('games', gameId);
  const event = {
    id: uuid(),
    time: Date.now(),
    userId: user.id,
    type,
    content
  };
  db.update('games', gameId, {
    events: x => [...x, event],
    ...gameUpdateFromEvent({ event })
  });
  actions.broadcastGame({ gameId, toRoom: false });
  actions.broadcastEvent({ gameId, event });
};

export default gameEvent;
