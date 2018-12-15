import uuid from 'uuid/v4';
import u from 'updeep';

import { gameEvents, gameStates } from '../common/constants';

const NUMBER_OF_SHIPS = 5;

const numberOfPlacedShips = ({ game: { boards } }) =>
  Object.values(boards).reduce(
    (sum, b) => sum + (b.ships || []).reduce(sum => sum + 1, 0),
    0
  );

const otherUser = ({ game, userId }) =>
  userId === game.host ? game.opponent : game.host;

const isHit = ({ ships }, [x, y]) =>
  ships.some(
    s =>
      s.rotation === 'h'
        ? x >= s.x && x < s.x + s.length && y === s.y
        : y >= s.y && y < s.y + s.length && x === s.x
  );

const gameUpdateFromEvent = ({ game, event }) => {
  let getUpdate = () => ({});
  switch (event.type) {
    case gameEvents.placeShip:
      getUpdate = () => {
        const { x, y, rotation, id, length } = event.content;
        return {
          ...(numberOfPlacedShips({ game }) + 1 === NUMBER_OF_SHIPS * 2 && {
            state: gameStates.playing,
            turn: game.host
          }),
          boards: {
            [event.userId]: {
              ships: ships => [...(ships || []), { x, y, rotation, id, length }]
            }
          }
        };
      };
      break;
    case gameEvents.guess:
      getUpdate = () => {
        const { x, y } = event.content;
        const boardId = otherUser({ game, userId: event.userId });
        return {
          turn: otherUser({ game, userId: game.turn }),
          boards: {
            [boardId]: {
              guesses: guesses => [
                ...(guesses || []),
                { x, y, isHit: isHit(game.boards[boardId], [x, y]) }
              ]
            }
          }
        };
      };
      break;
  }
  return getUpdate();
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
