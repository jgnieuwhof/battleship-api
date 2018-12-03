import { publicView } from '../model/game';

const games = ({ db }) => (_, fn) => fn(db.getAll('games', publicView));

export default games;
