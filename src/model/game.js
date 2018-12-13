import { pick } from 'lodash';

const publicView = game =>
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

export default {
  publicView,
  pv: publicView
};
