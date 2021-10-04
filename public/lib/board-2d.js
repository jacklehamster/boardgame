class Board2d {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.cells = new Array(this.width * this.height);		
		this.cachedMoves = {};
	}

	init() {
		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i] = null;
		}
		this.cachedMoves = {};
	}

	copy(board) {
		this.width = board.width;
		this.height = board.height;
		this.cells = JSON.parse(JSON.stringify(board.cells));
	}

	cellLocation(x, y) {
		return x + y * this.width;
	}

	getCell(x, y) {
		return this.cells[this.cellLocation(x, y)];
	}

	getCellAtId(id) {
		const location = id2location(id);
		if (!location) {
			return null;
		}
		const { x, y } = location;
		return this.getCell(x, y);
	}

	setCell(x, y, value) {
		this.cells[this.cellLocation(x, y)] = value;
	}

	setCells(locations, value) {
		locations.forEach(loc => {
			const { x, y } = id2location(loc);
			this.setCell(x, y, value);
		});
	}

	outOfBound(x, y) {
		return x < 0 || x >= this.width || y < 0 || y >= this.height;
	}

	move(moveText) {
		const [fromCellId, toCellId] = fromTo(moveText);
		const from = id2location(fromCellId);
		const to = id2location(toCellId);
		const fromUnit = this.getCell(from.x, from.y);
		const toUnit = this.getCell(to.x, to.y);
		this.setCell(from.x, from.y, null);
		this.setCell(to.x, to.y, this.mergeUnit(fromUnit, toUnit));
		this.cachedMoves = {};		
	}

	mergeUnit(sourceUnit, targetUnit) {
		return sourceUnit;
	}

	calculateMoves(x, y, result, filter) {
		console.log(`Override calculateMoves(${x},${y},result,filter)`)
		return 0;
	}

	getMoves(x, y, result, filter) {
		const tag = `${x}/${y}/${filter||""}`;
		if (this.cachedMoves[tag]) {
			let count = 0;
			for (let move in this.cachedMoves[tag]) {
				result[move] = this.cachedMoves[tag][move];
				count++;
			}
			return count;
		}
		const localResult = {};
		const countMoves = this.calculateMoves(x, y, localResult, filter);
		if (countMoves) {
			this.cachedMoves[tag] = localResult;
			for (let move in localResult) {
				result[move] = localResult[move];
			}
		}
		return countMoves;
	}

	possibleMoves(cellId, moves) {
		const location = id2location(cellId);
		if (!location) {
			return 0;
		}
		const { x, y } = location;
		return this.getMoves(x, y, moves);
	}

	passFilter(filter, move) {
		if (!filter) {
			return true;
		}
		const [from, to] = fromTo(move);
		const [action, subject] = filter.split("/");
		switch (action) {
			case "to":
				return to === subject;
			case "attacking":
				const unit = this.getCellAtId(to);
				return unit && unit.player === subject;
		}
		return false;
	}

	addIfValid(cellId, x, y, unit, result, filter, path) {
		const { player } = unit;
		const toId = location2id(x, y);
		const move = `${cellId}-${toId}`;
		if (this.outOfBound(x, y)) {
			return 0;
		}
		if (!this.passFilter(filter, move)) {
			return 0;
		}
		if (!this.canEnterCell(x, y, unit)) {
			return 0;
		}
		if (cellId === toId) {
			return 0;
		}
		if (!this.isTerminalMove(move) && !this.isLegalMove(move)) {
			return 0;
		}
		if (result[move]) {
			return 0;
		}
		result[move] = `${path.substr(1)}-${toId}`;
		return 1;
	}

	getTotalCoverage(player, moves) {
		let count = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.player === player) {
					count += this.getMoves(x, y, moves);
				}
			}
		}
		return count;
	}

	getAllUnits() {
		const units = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit) {
					units.push(unit);
				}
			}
		}
		return units;		
	}

	canEnterCell(x, y, unit) {
		const occupyingCell = this.getCell(x, y);
		if (!occupyingCell) {
			return true;
		}
		return unit.player !== occupyingCell.player;
	}

	isLegalBoard(turn) {
		return true;
	}

	isTerminalMove(move) {
		return false;
	}

	isLegalMove(move) {
		const [from, to] = fromTo(move);
		const unit = this.getCellAtId(from);
		const player = unit.player;
		const board = new (this.constructor)();
		board.copy(this);
		board.move(move);
		return board.isLegalBoard(opponentTurn(player));
	}
}