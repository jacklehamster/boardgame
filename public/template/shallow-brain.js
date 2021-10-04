//	Pick up move with best score without deep thoughts

class ShallowBrain extends Brain {
	constructor() {
		super();
	}

	chooseMove(model) {
		if (model.isHumanPlayer(model.turn)) {
			return null;
		}
		const moves = model.getMoves();
		let bestScore = Number.MIN_SAFE_INTEGER;
		let bestMove = null;
		moves.forEach(move => {
			const newModel = model.clone();
			newModel.performMove(move);
			const score = newModel.getScore(model.turn);
			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
		});
		return bestMove;
	}

	think(model) {
	}
}