class Model {
	constructor() {
		this.previousModel = null;
		this.nextMove = null;		
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

	copy(model) {
		console.log(`Override copy(model)`)
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
		for (let m = model.previousModel; m; m = m.previousModel) {
			callback(m, index);
			index++;
		}		
	}
}