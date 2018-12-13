import gameModel from '../model/game';

const games = ({ db }) => (_, fn) => fn(db.getAll('games', gameModel.pv));

export default games;
