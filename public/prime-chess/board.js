const MOVE4 = [
	{dx: 0, dy: -1},
	{dx: 1, dy: 0},
	{dx: 0, dy: 1},
	{dx: -1,dy: 0},
];

class Board extends Board2d {
	constructor() {
		super(8, 8);
		this.cachedMoves = {};
	}

	init() {
		super.init();
		this.setupPlayers();
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

	mergeUnit(sourceUnit, targetUnit) {
		if (targetUnit && targetUnit.player === sourceUnit.player) {
			sourceUnit.num += targetUnit.num;
		}
		return sourceUnit;
	}

	getPlayerDirection(player) {
		return player===2?1:-1;
	}

	getAllMovesFrom(cellId) {
		const unit = this.getCellAtId(cellId);
		if (unit.king || unit.pawn) {
			console.error("Method only for non-king / non-pawn units");
			return {};
		}
		const result = {};
		let path = "";
		const {x, y} = id2location(cellId);
		let queueHead = {
			num: unit.num,
			x, y, path: cellId,
		};
		let queueTail = queueHead;
		const visited = {
		};
		visited[`${x},${y},${unit.num}`] = true;
		while(queueHead) {
			if (queueHead.num) {
				MOVE4.forEach(({dx, dy}) => {
					const nx = queueHead.x + dx, ny = queueHead.y + dy;
					if (!visited[`${nx},${ny},${queueHead.num}`]) {
						visited[`${nx},${ny},${queueHead.num}`] = true;
						if (this.outOfBound(nx, ny)) {
							return;
						}
						if (this.getCell(nx, ny) && queueHead.num !== 1) {
							return;
						}

						queueTail = queueTail.next = {
							num: queueHead.num - 1,
							x: nx, y: ny,
							path: `${queueHead.path}-${location2id(nx, ny)}`,
						};
					}
				});
			} else {
				result[`${cellId}-${location2id(queueHead.x, queueHead.y)}`] = queueHead.path;
			}
			queueHead = queueHead.next;
		}
		return result;
	}

	getMoveHelperBFS(cellId, x, y, unit, result, filter) {
		const { player } = unit;
		const allMoves = this.getAllMovesFrom(cellId);
		let count = 0;
		for (let move in allMoves) {
			const [from,to] = fromTo(move);
			const location = id2location(to);
			count += this.addIfValid(cellId, location.x, location.y, unit, result, filter, "-" + allMoves[move]);
		}
		return count;
	}

	getMoveHelper(cellId, x, y, unit, result, filter) {
		return this.getMoveHelperDFS(cellId, x, y, unit, result, unit.num, {}, filter, "");
	}

	getMoveHelperDFS(cellId, x, y, unit, result, remainingCount, visited, filter, path) {
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
				count += this.getMoveHelperDFS(cellId, x + dx, y + dy, unit, result, remainingCount - 1, visited, filter, nextPath);
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
				const unit = this.getCell(x, y);
				if (unit && unit.player === player) {
					count += this.getMoves(x, y, moves);
				}
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
					count += this.getMoves(x, y, threats, `to/${cellId}`);
				}
			}
		}
		return count;
	}

	calculateMoves(x, y, result, filter) {
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
			MOVE4.forEach(({dx, dy}) => {
				countMoves += this.addIfValid(cellId, x + dx, y + dy, unit, result, filter, `-${cellId}`);
			});
		} else {
			countMoves += this.getMoveHelper(cellId, x, y, unit, result, filter);
		}	
		return countMoves;	
	}

	canEnterCell(x, y, unit) {
		const occupyingCell = this.getCell(x, y);
		if (!occupyingCell) {
			return true;
		}
		if (unit.player === occupyingCell.player) {
			if (unit.king || occupyingCell.king) {
				return false;
			}
			if (unit.num < occupyingCell.num) {
				return false;
			}
			if (unit.num + occupyingCell.num > 5) {
				return false;
			}
			return true;
		}
		return true;
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

	isTerminalMove(move) {
		const [from, to] = fromTo(move);
		const fromUnit = this.getCellAtId(from);
		const toUnit = this.getCellAtId(to);
		return fromUnit && toUnit && toUnit.king && toUnit.player !== fromUnit.player;
	}

	setCell(x, y, unit) {
		super.setCell(x, y, unit);
		if (unit && unit.pawn) {
			if (unit.player == 1 && y == 0 || unit.player == 2 && y == 7) {
				unit.pawn = false;
			}
		}
	}
}