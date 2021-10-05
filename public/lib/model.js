class Model {
	constructor() {
		this.previousModel = null;
		this.nextMove = null;
		this.id = (Math.random() + "").split(".")[1];
	}

	init() {
		this.previousModel = null;
		this.nextMove = null;
	}

	clone() {
		const newModel = new (this.constructor)();
		newModel.copy(this);
		return newModel;
	}

	setValidateLegal(validateLegal) {
	}

	copy(model) {
		console.log(`Override copy(model)`)
	}

	performMove(move) {
		console.log(`Override performMove("${move}")`)
	}

	revert() {
		const { previousModel } = this;
		this.copy(previousModel);
		this.previousModel = previousModel.previousModel;
	}

	saveHistory(move) {
		const previousModel = this.clone();
		previousModel.nextMove = move;
		previousModel.previousModel = this.previousModel;
		this.previousModel = previousModel;		
	}

	iterateModels(callback) {
		let index = 0;
		for (let m = this.previousModel; m; m = m.previousModel) {
			callback(m, index);
			index++;
		}		
	}

	isHumanPlayer(player) {
		return true;
	}

	getScore(player) {
		console.log(`Override getScore(player)`)
		return 0;
	}

	countMoves() {
		let c = 0;
		for (let m = this; m; m = m.previousModel) {
			c++;
		}	
		return c;
	}
}