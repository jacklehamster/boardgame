const MOVES = {
	king: [
		[-1,-1], [0,-1], [1,-1],
		[-1, 0],         [1, 0],
		[-1, 1], [0, 1], [1, 1], 
	],
	knight: [
		[-1,-2], [1,-2],
		[-2,-1], [1, 2],
		[-2, 1], [2, 1],
		[-1, 2], [1, 2],
	],
	queen: [
		[-1,-1], [0,-1], [1,-1],
		[-1, 0],         [1, 0],
		[-1, 1], [0, 1], [1, 1], 
	],
	bishop: [
		[-1,-1], [1,-1],
		[-1, 1], [1, 1], 
	],
	rook: [
		        [0,-1],
		[-1,0],         [1,0],
		        [0, 1], 
	],
};



class ChessBoard extends Board2d {
	constructor() {
		super(8, 8);
	}

	init() {
		super.init();
		this.setupPlayers();
	}

	setupPlayers() {
		this.setCells(["A1", "H1"], {
			player: 2,
			type: "rook",
		});
		this.setCells(["B1", "G1"], {
			player: 2,
			type: "knight",
		});
		this.setCells(["C1", "F1"], {
			player: 2,
			type: "bishop",
		});
		this.setCells(["D1"], {
			player: 2,
			type: "queen",
		});
		this.setCells(["E1"], {
			player: 2,
			type: "king",
		});

		this.setCells(["A8", "H8"], {
			player: 1,
			type: "rook",
		});
		this.setCells(["B8", "G8"], {
			player: 1,
			type: "knight",
		});
		this.setCells(["C8", "F8"], {
			player: 1,
			type: "bishop",
		});
		this.setCells(["D8"], {
			player: 1,
			type: "queen",
		});
		this.setCells(["E8"], {
			player: 1,
			type: "king",
		});
		for (let x = 0; x < this.width; x++) {
			this.setCell(x, 1, {
				player: 2,
				type: "pawn",
			});
			this.setCell(x, 6, {
				player: 1,
				type: "pawn",
			});
		}		
	}

	calculateMoves(x, y, result, filter) {
		const unit = this.getCell(x, y);
		if (!unit) {
			return 0;
		}
		const cellId = location2id(x, y);

		const moves = this.listMovesForUnit(x, y, unit.type, unit.player);
		let count = 0;
		moves.forEach(([x, y]) => {
			count += this.addIfValid(cellId, x, y, unit, result, filter, `-${cellId}`);
		});
		return count;
	}

	listMovesForUnit(x, y, type, player) {
		switch (type) {
			case "pawn":
				return this.listMovesForPawn(x, y, player);
				break;
			case "king":
				return this.listMovesForKing(x, y);
			case "knight":
				return this.listMovesForKnight(x, y);
			case "bishop":
				return this.listMovesForBishop(x, y);
			case "rook":
				return this.listMovesForRook(x, y);
			case "queen":
				return this.listMovesForQueen(x, y);	
		}
	}

	pawnAttackIfCan(player, x, y, list) {
		const unit = this.getCell(x, y);
		if (unit && unit.player !== player) {
			list.push([x, y]);
		}
	}

	listMovesForPawn(x, y, player) {
		const direction = player == 1 ? -1 : 1;
		const list = [];
		if (direction < 0) {
			list.push([x, y-1]);
			if (y === 6 && !this.getCell(x, y-1)) {
				list.push([x, y-2]);
			}
			this.pawnAttackIfCan(player, x-1, y-1, list);
			this.pawnAttackIfCan(player, x+1, y-1, list);
		} else {
			list.push([x, y+1]);
			if (y === 1 && !this.getCell(x, y+1)) {
				list.push([x, y+2]);
			}
			this.pawnAttackIfCan(player, x-1, y+1, list);
			this.pawnAttackIfCan(player, x+1, y+1, list);
		}
		return list;
	}

	listMovesForKing(x, y) {
		return MOVES.king.map(([dx, dy]) => [x + dx, y + dy]);
	}

	listMovesForKnight(x, y) {
		return MOVES.knight.map(([dx, dy]) => [x + dx, y + dy]);
	}

	listMovesUntilUnit(x, y,  moveList) {
		const list = [];
		moveList.forEach(([dx, dy]) => {
			for (let i = 1; !this.outOfBound(x + dx * i, y + dy * i); i++) {
				const unit = this.getCell(x + dx * i, y + dy * i);
				list.push([x + dx * i, y + dy * i]);
				if (unit) {
					break;
				}
			}
		});
		return list;
	}

	listMovesForBishop(x, y) {
		return this.listMovesUntilUnit(x, y, MOVES.bishop);
	}

	listMovesForRook(x, y) {
		return this.listMovesUntilUnit(x, y, MOVES.rook);
	}

	listMovesForQueen(x, y) {
		return this.listMovesUntilUnit(x, y, MOVES.queen);		
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

	isLegalBoard(turn) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.type === "king" && unit.player !== turn) {
					if (this.getThreats(location2id(x, y), opponentTurn(turn), {})) {
						return false;
					}
				}
			}
		}
		return true;
	}

	getKing(player) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit && unit.type === "king" && unit.player === player) {
					return location2id(x, y);
				}
			}
		}
		return null;
	}

	isTerminalMove(move) {
		const [from, to] = fromTo(move);
		const fromUnit = this.getCellAtId(from);
		const toUnit = this.getCellAtId(to);
		return fromUnit && toUnit && toUnit.type === "king" && toUnit.player !== fromUnit.player;
	}
}