class CrossPrimeModel extends Model {
	constructor() {
		super();
		this.turn = 1;
		this.board = new Board();
	}

	init() {
		super.init();
		this.turn = 1;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.returnUndo = false;
		this.humans = [true, true];
		this.crossPrime = new CrossPrimeCombos(this.board.width);
		this.board.init();
	}

	clone() {
		const newModel = new (this.constructor)();
		newModel.copy(this);
		newModel.crossPrime = this.crossPrime;
		return newModel;
	}

	setValidateLegal(validateLegal) {
		this.board.validateLegal = validateLegal;
	}

	isValidateLegal() {
		return this.board.validateLegal;;
	}

	isLegalMove(move) {
		return this.board.isLegalMove(move);
	}

	copy(model) {
		this.turn = model.turn;
		this.selectedCell = model.selectedCell;
		this.hoveredCell = model.hoveredCell;
		this.hoveredButton = model.hoveredButton;
		this.board.copy(model.board);
	}

	unitCanPlay(cellId) {
		const loc = id2location(cellId);
		if (!loc) {
			return false;
		}
		const { x, y } = id2location(cellId);
		if (this.board.outOfBound(x, y)) {
			return false;
		}
		const unit = this.board.getCellAtId(cellId);
		return !unit;
	}

	click(cell, action) {
		if (action) {
			this.performAction(action);
			return;
		}

		if (!this.isHumanPlayer(this.turn)) {
			return;
		}

		if (this.unitCanPlay(cell)) {
			this.performMove(cell);
		}
	}

	getNextNumber() {
		return this.board.nextNumber;
	}

	performAction(action) {
		switch(action) {
			case "undo":
				do {
					this.revert();
				} while (this.previousModel && !this.isHumanPlayer(this.turn));
				break;
			case "restart":
				this.init();
				break;
			case "player1":
				this.humans[0] = !this.humans[0];
				break;
			case "player2":
				this.humans[1] = !this.humans[1];
				break;
		}
	}

	performMove(move) {
		this.hoveredCell = null;
		this.hoveredButton = null;
		if (this.canSaveHistory) {
			this.saveHistory(move);
		}
	
		const undo = this.board.move(move, this.returnUndo);
		this.switchTurn();
		return undo;
	}

	switchTurn() {
		this.turn = opponentTurn(this.turn);
	}

	gameOver() {
		return false;
	}

	isHumanPlayer(player) {
		 return this.humans[player-1];
	}

	getMoves() {
		const moves = {};
		this.board.getTotalCoverage(this.turn, moves);
		const moveList = Object.keys(moves);
		moveList.sort();
		return moveList;
	}

	getRow(row) {
		const line = [];
		for (let i = 0; i < this.board.cols; i++) {
			const unit = this.board.getCell(i, row);
			if (unit) {
				line.push(unit);
			}
		}
		return unit.join(",");
	}

	getScore(player) {
		if (!player) {
			player = this.turn;
		}
		let score = 0;

		// let 
		// for (let i = 0; i < this.board.height; i++) {

		// }


		return score;
	}
}