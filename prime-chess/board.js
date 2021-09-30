const MOVE4 = [
	{dx: 0, dy: -1},
	{dx: 1, dy: 0},
	{dx: 0, dy: 1},
	{dx: -1,dy: 0},
];

class Board {
	constructor() {
		this.width = 8;
		this.height = 8;
		this.cells = new Array(this.width * this.height);
		this.cachedMoves = {};
	}

	init() {
		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i] = null;
		}
		this.setupPlayers();
		this.cachedMoves = {};
	}

	copy(board) {
		this.width = board.width;
		this.height = board.height;
		this.cells = JSON.parse(JSON.stringify(board.cells));
	}

	setupPlayers() {
		this.setCells(["A1", "H1"], {
			player: 2,
			num: 4,
		});
		this.setCells(["B1", "G1"], {
			player: 2,
			num: 3,
		});
		this.setCells(["C1", "F1"], {
			player: 2,
			num: 2,
		});
		this.setCells(["D1"], {
			player: 2,
			num: 5,
		});
		this.setCells(["E1"], {
			player: 2,
			num: 1,
			king: true,
		});

		this.setCells(["A8", "H8"], {
			player: 1,
			num: 4,
		});
		this.setCells(["B8", "G8"], {
			player: 1,
			num: 3,
		});
		this.setCells(["C8", "F8"], {
			player: 1,
			num: 2,
		});
		this.setCells(["D8"], {
			player: 1,
			num: 5,
		});
		this.setCells(["E8"], {
			player: 1,
			num: 1,
			king: true,
		});
		for (let x = 0; x < this.width; x++) {
			this.setCell(x, 1, {
				player: 2,
				num: 1,
				pawn: true,
			});
			this.setCell(x, 6, {
				player: 1,
				num: 1,
				pawn: true,
			});
		}
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
		if (targetUnit && targetUnit.player === sourceUnit.player) {
			sourceUnit.num += targetUnit.num;
		}
		return sourceUnit;
	}

	possibleMoves(cellId, moves) {
		const location = id2location(cellId);
		if (!location) {
			return 0;
		}
		const { x, y } = location;
		return this.getMoves(x, y, moves);
	}

	outOfBound(x, y) {
		return x < 0 || x >= this.width || y < 0 || y >= this.height;
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
		if (!this.isLegalMove(move)) {
			return 0;
		}
		if (result[move]) {
			return 0;
		}
		result[move] = `${path.substr(1)}-${toId}`;
		return 1;
	}

	canEnterCell(x, y, unit) {
		const occupyingCell = this.getCell(x, y);
		if (!occupyingCell) {
			return true;
		}
		if (unit.player === occupyingCell.player) {
			return !unit.king && !occupyingCell.king && unit.num >= occupyingCell.num;
		}
		return true;
	}

	getPlayerDirection(player) {
		return player===2?1:-1;
	}

	getMoveHelper(cellId, x, y, unit, result, remainingCount, visited, filter, path) {
		const { player } = unit;
		if (remainingCount === 0) {
			return this.addIfValid(cellId, x, y, unit, result, filter, path);
		}
		let count = 0;
		const nextPath = `${path}-${location2id(x, y)}`
		MOVE4.forEach(({dx, dy}) => {
			const targetUnit = this.getCell(x + dx, y + dy);
			if (targetUnit && (remainingCount > 1 || !this.canEnterCell(x + dx, y + dy, unit))) {
				return;
			}
			if (this.outOfBound(x + dx, y + dy)) {
				return;
			}

			const id = location2id(x + dx, y + dy);
			if (!visited[id]) {
				visited[id] = true;
				count += this.getMoveHelper(cellId, x + dx, y + dy, unit, result, remainingCount - 1, visited, filter, nextPath);
				visited[id] = false;
			}
		});
		return count;
	}

	canPawnMoveTo(cellId, tx, ty) {
		const { x, y } = id2location(cellId);
		if (x !== tx && y !== ty) {
			return false;
		}
		const dx = tx > x ? 1 : tx < x ? -1 : 0;
		const dy = ty > y ? 1 : ty < y ? -1 : 0;
		let px = x, py = y;
		while (px !== tx || py !== ty) {
			px += dx;
			py += dy;
			if (this.getCell(px, py)) {
				return px === tx && py === ty;
			}
		}
		return true;
	}

	getTotalCoverage(player, moves) {
		let count = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				count += this.getMoves(x, y, moves);
			}
		}
		return count;
	}

	getTotalThreats(player, moves) {
		let count = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.player !== player) {
					count += this.getMoves(x, y, moves, `attacking/${player}`);
				}
			}
		}
		return count;
	}

	getThreats(cellId, player, threats) {
		const target = id2location(cellId);
		if (!target) {
			return 0;
		}
		let count = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.player !== player) {
					count += this.getMoves(x, y, threats, `to/${cellId}`);//move => fromTo(move)[1] === cellId);
				}
			}
		}
		return count;
	}

	getMoves(x, y, result, filter) {
		const tag = `${x}/${y}/${filter}`;
		// if (this.cachedMoves[tag]) {
		// 	let count = 0;
		// 	for (let move in this.cachedMoves[tag]) {
		// 		result[move] = this.cachedMoves[tag][move];
		// 		count++;
		// 	}
		// 	return count;
		// }
		const unit = this.getCell(x, y);
		if (!unit) {
			return 0;
		}
		const { num, king, pawn, player } = unit;
		const cellId = location2id(x, y);
		let countMoves = 0;
		if (pawn) {
			const dy = this.getPlayerDirection(player) * num;
			if (this.canPawnMoveTo(cellId, x - num, y)) {
				countMoves += this.addIfValid(cellId, x - num, y, unit, result, filter, `-${cellId}`);
			}
			if (this.canPawnMoveTo(cellId, x + num, y)) {
				countMoves += this.addIfValid(cellId, x + num, y, unit, result, filter, `-${cellId}`);
			}
			if (this.canPawnMoveTo(cellId, x, y + dy)) {
				countMoves += this.addIfValid(cellId, x, y + dy, unit, result, filter, `-${cellId}`);
			}
		} else if (king) {
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					countMoves += this.addIfValid(cellId, x + dx, y + dy, unit, result, filter, `-${cellId}`);					
				}
			}
		} else {
			countMoves += this.getMoveHelper(cellId, x, y, unit, result, num, {}, filter, "");
		}
		if (countMoves) {
			this.cachedMoves[tag] = {};
			for (let move in result) {
				this.cachedMoves[tag][move] = result[move];
			}
		}
		return countMoves;
	}

	isLegalBoard(turn) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.king && unit.player !== turn) {
					if (this.getThreats(location2id(x, y), opponentTurn(turn), {})) {
						return false;
					}
				}
			}
		}
		return true;
	}

	isLegalMove(move) {
		const [from, to] = fromTo(move);
		const unit = this.getCellAtId(from);
		const player = unit.player;
		const board = new Board();
		board.copy(this);
		board.move(move);
		return board.isLegalBoard(opponentTurn(player));
	}
}