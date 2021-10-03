class UnstableModel extends Model {
	constructor() {
		super();
		this.board = new ChessBoard();
		this.turn = 1;
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
		const newModel = new (this.constructor)();
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

	performMove(move) {
		this.hoveredCell = null;
		this.hoveredButton = null;
		const previousModel = this.clone();
		previousModel.nextMove = move;
		previousModel.previousModel = this.previousModel;
		this.previousModel = previousModel;

		this.selectedCell = null;
		this.board.move(move);
		this.switchTurn();
	}

	switchTurn() {
		this.turn = opponentTurn(this.turn);
	}
}