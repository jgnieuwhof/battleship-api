import uuid from 'uuid/v4';
import u from 'updeep';

import { gameEvents } from '../common/constants';

const gameUpdateFromEvent = ({ game, event }) => {
  switch (event.type) {
    case gameEvents.placeShip:
      const { x, y, rotation, id, length } = event.content;
      const numberOfPlacedShips = Object.values(game.boards).reduce(
        (sum, b) => sum + (b.ships || []).reduce(sum => sum + 1, 0),
        0
      );
      const isFinishedPlacing =
        numberOfPlacedShips + 1 === game.numberOfShips * 2;
      return {
        ...(isFinishedPlacing && { state: gameEvents.playing }),
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
    ...gameUpdateFromEvent({ game, event })
  });
  actions.broadcastGame({ gameId, toRoom: false });
  actions.broadcastEvent({ gameId, event });
};

export default gameEvent;
