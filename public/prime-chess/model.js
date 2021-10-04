class PrimeChessModel extends Model {
	constructor() {
		super();
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.board = new Board();
	}

	init() {
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.board.init();
	}

	clone() {
		const newModel = new (this.constructor)();
		newModel.copy(this);
		return newModel;
	}

	copy(model) {
		super.copy(model);
		this.turn = model.turn;
		this.selectedCell = model.selectedCell;
		this.hoveredCell = model.hoveredCell;
		this.hoveredButton = model.hoveredButton;
		this.board.copy(model.board);
	}

	unitCanPlay(cellId) {
		const unit = this.board.getCellAtId(cellId);
		return unit && unit.player === this.turn;
	}

	click(cell, action) {
		if (action) {
			this.performAction(action);
			return;
		}

		if (!this.isHumanPlayer(this.turn)) {
			return;
		}

		if (cell === this.selectedCell) {
			this.selectedCell = null;
		} else {
			const moves = {};
			if (this.unitCanPlay(this.selectedCell)) {
				this.board.possibleMoves(this.selectedCell, moves);
			}
			const move = `${this.selectedCell}-${cell}`;
			if (moves[move]) {
				this.performMove(move);
			} else if (this.unitCanPlay(cell) && this.board.possibleMoves(cell, moves)) {
				this.selectedCell = cell;
			} else {
				this.selectedCell = null;
			}
		}
	}

	performAction(action) {
		switch(action) {
			case "[ undo ]":
				this.revert();
				break;
			case "[ restart ]":
				this.init();
				break;
		}
	}

	performMove(move) {
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.saveHistory(move);
	
		this.selectedCell = null;
		this.board.move(move);
		this.switchTurn();
	}

	switchTurn() {
		this.turn = opponentTurn(this.turn);
	}

	gameOver() {
		return this.board.getTotalCoverage(this.turn, {}) === 0;
	}
}