import { pick } from 'lodash';

export const publicView = game =>
  pick(game, [
    'id',
    'state',
    'host',
    'hostName',
    'opponent',
    'opponentName',
    'numberOfShips',
    'shotsPerTurn',
    'dimensions'
  ]);
