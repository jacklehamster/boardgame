class ChessRenderer extends GridRenderer {
	constructor() {
		super();
	}

	async drawBoard() {
		const dark = await this.loadImage("img/darkcell.png");
		const light = await this.loadImage("img/lightcell.png");
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				this.drawImage(location2id(col, row), (row+col)%2 ? dark:light);
			}
		}
	}

	async drawPiece(cellId, color, piece) {
		const img = await this.loadImage(`img/${color}-${piece}.svg`);
		this.drawImage(cellId, img);
	}

	async render(model) {
		this.setRect(50, 50, 400, 400);
		this.setDimensions(8, 8);
		this.clear();
		await this.drawBoard();
		this.drawGrid(true);

		const playerTurn = model.isHumanPlayer(model.turn);

		const selected = model.selectedCell;
		const cellUnderMouse = model.hoveredCell;
		const cellHighlighted = selected || cellUnderMouse;
		let possiblePath = null;

		const moves = {};

		if (playerTurn && model.unitCanPlay(cellHighlighted) && model.board.possibleMoves(cellHighlighted, moves)) {
			for (let move in moves) {
				const [from, to] = fromTo(move);
				const unitAtDestination = model.board.getCellAtId(to);
				const attacking = unitAtDestination && unitAtDestination.player !== model.turn;
				this.boldCell(to, attacking ? "#aa0000" : "#00aa00");
				this.highlight(to, unitAtDestination && unitAtDestination.player !== model.turn ? "attacking" : "possible-move-2");
				if (to === cellUnderMouse) {
					possiblePath = moves[move];
				}
			}
			this.boldCell(cellHighlighted, "#ff9900");
			this.highlight(cellHighlighted, "hovered");
		}

		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const cellId = location2id(col, row);
				const unit = model.board.getCellAtId(cellId);
				if (unit) {
					await this.drawPiece(cellId, unit.player === 1 ? "white" : "black", unit.type);
				}
			}
		}

		const unitHovered = model.board.getCellAtId(cellUnderMouse);

		this.setCursor(playerTurn && unitHovered && unitHovered.player === model.turn || model.hoveredButton ? "pointer" : "auto");

		if (selected) {
			this.boldCell(selected);
			if (possiblePath) {
				this.boldCell(cellUnderMouse);
			}
		}

		const kingCell = model.board.getKing(model.turn);
		const threats = {};
		if (model.board.getThreats(kingCell, model.turn, threats)) {
			this.boldCell(kingCell, "#ff0000");
			for (let move in threats) {
				const [from, to] = fromTo(move);
				this.boldCell(from, "#ff0000");
			}
		}

		model.iterateModels(({nextMove}, index) => {
			this.drawText(8.5, index / 2, nextMove, "20px serif", "#888888");
		});

		if (model.gameOver()) {
			this.drawText(model.board.width / 2 - 1.5, -1.2, "game over", "20px serif", "#880000");			
			const label = "[ restart ]";
			this.drawButton(label, "20px serif", model.hoveredButton === label ? "#3333FF" : "#888888")
		} else if (playerTurn && model.previousModel) {
			const label = "[ undo ]";
			this.drawButton(label, "20px serif", model.hoveredButton === label ? "#3333FF" : "#888888")
		}



		if (!model.board.isLegalBoard(model.turn)) {
			this.drawText(model.board.width / 2 - 1.5, -1.2, "invalid board", "20px serif", "#880000");			
		}
	}
}