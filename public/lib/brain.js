class Brain {
	constructor(thinkPeriod) {
		this.thinkPeriod = thinkPeriod || 1000;
	}

	chooseMove(model) {
		const moves = model.getMoves();
		return null;
	}

	think(model) {
	}
}