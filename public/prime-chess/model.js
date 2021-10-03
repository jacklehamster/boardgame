class PrimeChessModel extends Model {
	constructor() {
		super();
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.previousModel = null;
		this.nextMove = null;
		this.board = new Board();
	}

	init() {
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.previousModel = null;
		this.nextMove = null;
		this.board.init();
	}

	clone() {
		const newModel = new PrimeChessModel();
		newModel.copy(this);
		return newModel;
	}

	copy(model) {
		this.turn = model.turn;
		this.selectedCell = model.selectedCell;
		this.hoveredCell = model.hoveredCell;
		this.hoveredButton = model.hoveredButton;
		this.board.copy(model.board);
	}

	switchTurn() {
		this.turn = opponentTurn(this.turn);
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
		}
	}

	revert() {
		const { previousModel } = this;
		this.copy(previousModel);
		this.previousModel = previousModel.previousModel;
	}
}