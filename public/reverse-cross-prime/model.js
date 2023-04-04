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
		this.humans = JSON.parse(localStorage.getItem("humans") || "[true, true]");
		this.combos = new CrossPrimeCombos(this.board.width);
		this.possibilities = [
			new Array(this.board.height).fill(null).map(_ => {
				return {};
			}),
			new Array(this.board.width).fill(null).map(_ => {
				return {};
			}),
		];
		this.lineScore = [
			new Array(this.board.height).fill(null).map(_ => {
				return 0;
			}),
			new Array(this.board.width).fill(null).map(_ => {
				return 0;
			}),
		];
		this.calculatePossibilities(this.possibilities);
		this.calculateLineScores(this.possibilities, this.combos.codeToScore);
		this.board.init();
	}

	calculatePossibilities(possibilities, cont, list) {
		if (!cont) {
			return this.calculatePossibilities(possibilities,
				[],
				new Array(this.board.width * this.board.height).fill(null).map((_,index) => index+1)
			);
		}
		cont.sort((a, b) => parseInt(a) - parseInt(b));
		if (cont.length >= this.board.width) {
			possibilities[0].forEach((map, index) => {
				const code = numCode(cont);
				map[code] = cont.join(",");
			});
			possibilities[1].forEach((map, index) => {
				const code = numCode(cont);
				map[code] = cont.join(",");
			});
			return;
		}
		for (let i = 0; i < list.length; i++) {
			this.calculatePossibilities(possibilities,
				cont.concat([list[i]]),
				list.slice(0, i).concat(list.slice(i+1)));
		}
	}

	calculateLineScores(possibilities, codeToScore) {
		if (!possibilities) {
			possibilities = this.possibilities;
		}
		if (!codeToScore) {
			codeToScore = this.combos.codeToScore;
		}
		{
			possibilities[0].forEach((map, row) => {
				let lScore = 0;
				for (let code in map) {
					lScore += codeToScore[code];
				}
				this.lineScore[0][row] = lScore / Object.keys(possibilities[0][row]).length;
			});
		}
		{
			possibilities[1].forEach((map, col) => {
				let lScore = 0;
				for (let code in map) {
					lScore += codeToScore[code];
				}
				this.lineScore[1][col] =  lScore / Object.keys(possibilities[1][col]).length;
			});
		}
		return this.lineScore;
	}

	updatePossibilities(move, num) {
		const {x, y} = id2location(move);
		this.possibilities[0].forEach((map, row) => {
			const codesToDelete = [];
			for (let code in map) {
				if (numCode([num]) & parseInt(code)) {	//	num is part of code
					if (row !== y) {
						codesToDelete.push(code);
					}
				} else {	//	num is not part of code
					if (row === y) {
						codesToDelete.push(code);
					}
				}
			}
			this.lineScore[0][row] *= Object.keys(map).length;
			codesToDelete.forEach(code => {
				delete map[code];
				this.lineScore[0][row] -= this.combos.codeToScore[code];
			});
			this.lineScore[0][row] /= Object.keys(map).length;
		});
		this.possibilities[1].forEach((map, col) => {
			const codesToDelete = [];
			for (let code in map) {
				if (numCode([num]) & parseInt(code)) {
					if (col !== x) {
						codesToDelete.push(code);
					}
				} else {
					if (col === x) {
						codesToDelete.push(code);
					}
				}
			}
			this.lineScore[1][col] *= Object.keys(map).length;
			codesToDelete.forEach(code => {
				delete map[code];
				this.lineScore[1][col] -= this.combos.codeToScore[code];
			});
			this.lineScore[1][col] /= Object.keys(map).length;
		});

	}

	clone() {
		const newModel = new (this.constructor)();
		newModel.copy(this);
		newModel.combos = this.combos;
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
		this.possibilities = JSON.parse(JSON.stringify(model.possibilities));
		this.lineScore = JSON.parse(JSON.stringify(model.lineScore));
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
				localStorage.setItem("humans", JSON.stringify(this.humans));
				break;
			case "player2":
				this.humans[1] = !this.humans[1];
				localStorage.setItem("humans", JSON.stringify(this.humans));
				break;
		}
	}

	performMove(move) {
		this.hoveredCell = null;
		this.hoveredButton = null;
		if (this.canSaveHistory) {
			this.saveHistory(move);
		}
		const numberPlayed = this.getNextNumber();
		const undo = this.board.move(move, this.returnUndo);

		this.updatePossibilities(move, numberPlayed);
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
		const shouldLimit = this.getNextNumber() === 14;

		const moves = [];
		for (let y = 0; y < this.board.height; y++) {
			for (let x = 0; x < this.board.width; x++) {
				if (shouldLimit) {
					if (!this.board.getCell(this.board.width - 1 - x, this.board.height - 1 - y)
						&& !this.board.getCell(x, this.board.height - 1 - y)
						&& !this.board.getCell(this.board.width - 1 - x, y)) {
						continue;
					}
				}


				const unit = this.board.getCell(x, y);
				if (!unit) {
					moves.push(location2id(x, y));
				}
			}
		}
		return moves;
	}

	getRow(row) {
		const line = [];
		for (let i = 0; i < this.board.width; i++) {
			const unit = this.board.getCell(i, row);
			if (unit) {
				line.push(unit);
			}
		}
		line.sort((a, b) => parseInt(a) - parseInt(b));
		return line.join(",");
	}

	getCol(col) {
		const line = [];
		for (let i = 0; i < this.board.height; i++) {
			const unit = this.board.getCell(col, i);
			if (unit) {
				line.push(unit);
			}
		}
		line.sort((a, b) => parseInt(a) - parseInt(b));
		return line.join(",");
	}

	getScore(player) {
		if (!player) {
			player = this.turn;
		}
		let score = 0;

		{
			let localScore = 0;
			this.lineScore[0].forEach(score => {
				localScore += score;
			});
			score += player === 2 ? localScore : -localScore;
		}
		{
			let localScore = 0;
			this.lineScore[1].forEach(score => {
				localScore += score;
			});
			score += player === 1 ? localScore : -localScore;
		}
		return score;
	}

	thinkHard() {
		if (this.getNextNumber() >= 14) {
			return false;
		}
		return true;
	}
}