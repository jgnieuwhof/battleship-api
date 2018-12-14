import uuid from 'uuid/v4';
import u from 'updeep';

import { gameEvents, gameStates } from '../common/constants';

const numberOfPlacedShips = ({ game: { boards } }) =>
  Object.values(boards).reduce(
    (sum, b) => sum + (b.ships || []).reduce(sum => sum + 1, 0),
    0
  );

const gameUpdateFromEvent = ({ game, event }) => {
  switch (event.type) {
    case gameEvents.placeShip:
      const { x, y, rotation, id, length } = event.content;
      return {
        ...(numberOfPlacedShips({ game }) + 1 === game.numberOfShips * 2 && {
          state: gameStates.playing,
          turn: game.host
        }),
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
  actions.broadcastGame({ gameId });
  actions.broadcastEvent({ gameId, event });
};

export default gameEvent;
