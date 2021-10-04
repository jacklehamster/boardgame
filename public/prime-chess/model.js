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

	isHumanPlayer(player) {
		// return true;
		return player === 1;
	}

	getMoves() {
		const moves = {};
		this.board.getTotalCoverage(this.turn, moves);
		const moveList = Object.keys(moves);
		moveList.sort();
		return moveList;
	}

	getScore(player) {
		if (!player) {
			player = this.turn;
		}
		if (this.gameOver()) {
			return this.turn === player ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		}
		//	calculate score based on pieces
		let score = this.getUnitScore(player);

		score += this.getCoverageScoreForPlayer(player, this.turn);
		score -= this.getCoverageScoreForPlayer(opponentTurn(player), this.turn);
		return score;
	}

	getUnitScore(player) {
		let score = 0;
		const units = this.board.getAllUnits();
		units.forEach(unit => {
			const multiplier = unit.player === player ? 1 : -1;
			score += multiplier * (unit.pawn ? 1 : unit.num * 200);
		});
		return score;
	}

	getCoverageScoreForPlayer(player, turn) {
		let score = 0;
		const direction = player === 1 ? -1 : 1;
		const coverage = {};
		const coverageCount = this.board.getTotalCoverage(player, coverage);
		for (let move in coverage) {
			const [from, to] = fromTo(move);
			const targetUnit = this.board.getCellAtId(to);
			if (!targetUnit) {
				score += 20;
			} else if (targetUnit.player === player) {
				score += 25;
			} else {
				score += targetUnit.num * 50;
			}
			const { x, y } = id2location(from);
			score += direction * (y - 3.5);
		}
		return score * (turn === player ? 1.5 : 1);		
	}
}