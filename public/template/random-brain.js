class RandomBrain extends Brain {
	constructor() {
		super();
	}

	chooseMove(model) {
		const moves = model.getMoves();
		return moves[Math.floor(Math.random() * moves.length)];
	}

	think(model) {
	}
}