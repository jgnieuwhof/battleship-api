import { pick } from 'lodash';

import { gameEvent } from '../common/constants';

const publicContentForEvent = ({ event }) => {
  switch (event.type) {
    case gameEvent.placeShip:
      return [''];
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
