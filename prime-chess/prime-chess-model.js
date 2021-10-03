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

	render(renderer) {
		renderer.setRect(50, 50, 400, 400);
		renderer.setDimensions(this.board.width, this.board.height);
		renderer.clear();

		//	Bottom layer

		if (this.turn === 1) {
			renderer.drawTurn(475, 400, 10, this.turn);
		} else {
			renderer.drawTurn(475, 100, 10, this.turn);			
		}

		const selected = this.selectedCell;

		const moves = {};
		const cellUnderMouse = this.hoveredCell;
		const cellHighlighted = selected || cellUnderMouse;
		let possiblePath = null;

		if (this.unitCanPlay(cellHighlighted) && this.board.possibleMoves(cellHighlighted, moves)) {
			renderer.highlight(cellHighlighted, "hovered");
			for (let move in moves) {
				const [from, to] = fromTo(move);
				renderer.highlight(to, "possible-move");
				if (to === cellUnderMouse) {
					possiblePath = moves[move];
				}
			}
		}

		const unitHovered = this.board.getCellAtId(cellUnderMouse);

		renderer.drawGrid();

		// const totalCoverage = {};
		// this.board.getTotalCoverage(this.turn, totalCoverage);
		// for (let move in totalCoverage) {
		// 	const [from, to] = fromTo(move);
		// 	const { x, y } = id2location(to);
		// 	const unit = this.board.getCell(x, y);
		// 	if (!unit || unit.player !== this.turn) {
		// 		renderer.drawCircle(x, y, .5, "#FFf5f5");
		// 		renderer.drawCircle(x, y, .3, "#FFeedd");
		// 	}
		// }

		const totalThreats = {};
		this.board.getTotalCoverage(opponentTurn(this.turn), totalThreats);
		for (let move in totalThreats) {
			const [from, to] = fromTo(move);
			const { x, y } = id2location(to);
			const unit = this.board.getCell(x, y);
			if (!unit || unit.player !== this.turn) {
				renderer.drawCircle(x, y, .5, "#eeFFdd");
				renderer.drawCircle(x, y, .3, "#ddFFdd");
			}
			if (unit && unit.player === this.turn && unit.king) {
				renderer.highlight(to, "threatened");
			}
		}


		if (possiblePath) {
			renderer.drawPath(possiblePath);
		}


		//	Top layer

		const threats = {};
		const selectedUnit = this.board.getCellAtId(cellHighlighted);
		if (selectedUnit && selectedUnit.player === this.turn) {
			if (this.board.getThreats(cellHighlighted, this.turn, threats)) {
				for (let move in threats) {
					const [from, to] = fromTo(move);
					renderer.boldCell(from, "#00aa00")
				}			
			}
		}

		if (selected) {
			renderer.boldCell(selected);
			if (possiblePath) {
				renderer.boldCell(cellUnderMouse);
			}
		}

		for (let y = 0; y < this.board.height; y++) {
			for (let x = 0; x < this.board.width; x++) {
				const unit = this.board.getCell(x, y);
				if (unit) {
					const { player, num, king, pawn } = unit;
					const direction = this.board.getPlayerDirection(player);
					if (pawn) {
						renderer.drawTriangle(x, y, player, direction);
					} else if (king) {
						renderer.drawRect(x, y, player);
					} else {
						renderer.drawUnit(x, y, player);
					}
					const offset = !pawn ? 0 : direction * -.1;
					renderer.drawText(x, y + offset, num, '30px serif', "#000000");
				}
			}
		}

		for (let move in totalThreats) {
			const [from, to] = fromTo(move);
			const { x, y } = id2location(to);
			const unit = this.board.getCell(x, y);
			if (unit && unit.player === this.turn) {
				renderer.drawText(x+.35, y-.25, "!", '16px serif bold', "#00aa00");
			}
		}

		if (this.previousModel) {
			const label = "[ undo ]";
			renderer.drawButton(label, "20px serif", this.hoveredButton === label ? "#3333FF" : "#888888")
		}

		renderer.setCursor(unitHovered && unitHovered.player === this.turn || this.hoveredButton ? "pointer" : "auto");

		let line = 0;
		for (let model = this.previousModel; model; model = model.previousModel) {
			const { nextMove } = model;
			renderer.drawText(9.5, line / 2, nextMove, "20px serif", "#888888");
			line++;
		}

		if (!this.board.isLegalBoard(this.turn)) {
			renderer.drawText(this.board.width / 2 - 1.5, -1.2, "invalid board", "20px serif", "#880000");			
		}
	}
}