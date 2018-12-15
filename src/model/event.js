import { pick } from 'lodash';

import { gameEvents } from '../common/constants';

const publicContentForEvent = ({ event }) => {
  switch (event.type) {
    case gameEvents.placeShip:
      return [''];
    case gameEvents.guess:
      return ['x', 'y'];
    default:
      console.log(`ERROR: unknown event type "${event.type}"`);
      return [];
  }
};

const eventForUser = ({ event, userId }) => ({
  ...event,
  content:
    userId === event.userId
      ? event.content
      : pick(event, publicContentForEvent({ event }))
});

export default {
  eventForUser
};
