const games = ({ db }) => (_, fn) => fn(db.gamesSummary());

export default games;
