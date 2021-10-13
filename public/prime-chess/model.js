class PrimeChessModel extends Model {
	constructor() {
		super();
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.canSaveHistory = true;
		this.returnUndo = false;
		this.board = new Board();
	}

	init() {
		super.init();
		this.turn = 1;
		this.selectedCell = null;
		this.hoveredCell = null;
		this.hoveredButton = null;
		this.canSaveHistory = true;
		this.returnUndo = false;
		this.board.init();
	}

	clone() {
		const newModel = new (this.constructor)();
		newModel.copy(this);
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
				do {
					this.revert();
				} while (this.previousModel && !this.isHumanPlayer(this.turn));
				break;
			case "[ restart ]":
				this.init();
				break;
		}
	}

	setSaveHistory(save) {
		this.canSaveHistory = save;
	}

	performMove(move) {
		this.hoveredCell = null;
		this.hoveredButton = null;
		if (this.canSaveHistory) {
			this.saveHistory(move);
		}
	
		this.selectedCell = null;
		const undo = this.board.move(move, this.returnUndo);
		this.switchTurn();
		return undo;
	}

	switchTurn() {
		this.turn = opponentTurn(this.turn);
	}

	gameOver() {
		const units = this.board.getAllUnits();
		if (units.filter(unit => unit.player === this.turn).length <= 1) {
			return true;
		}
		const wasValidateLegal = this.isValidateLegal();
		const isGameOver = this.board.getTotalCoverage(this.turn, {}) === 0;
		this.setValidateLegal(wasValidateLegal);
		return isGameOver;
	}

	isHumanPlayer(player) {
		 return false;
//		 return true;
		// return player === 1;
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
		const { variant } = this;
		const unitValue = variant ? 300 : 320;
		const eachUnit = variant ? 150 : 150;
		const pawnMultiplier = variant ? .2 : .2;
		let score = 0;
		let foeScore = 0;
		const units = this.board.getAllUnits();
		units.forEach(unit => {
			if (unit.player === player) {
				score += (unit.pawn ? pawnMultiplier : unit.num * unitValue) + eachUnit;
			} else {
				foeScore += (unit.pawn ? pawnMultiplier : unit.num * unitValue) + eachUnit;
			}
		});
		const bonus = (score > foeScore ? 1000 * score / foeScore : -1000 * foeScore / score);

		return (score - foeScore) + bonus * (Math.random() + 5) / 5;
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
				score += 15;
			} else if (targetUnit.player === player) {
				score += 15;
			} else {
				score += targetUnit.num * 20;
			}
			const { x, y } = id2location(from);
			score += direction * (y - 3.5);
		}
		return score * (turn === player ? 1.5 : 1);		
	}
}