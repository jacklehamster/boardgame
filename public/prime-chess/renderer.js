class PrimeChessRenderer extends GridRenderer {
	constructor() {
		super();
	}

	getPlayerColor(player, king) {
		if (king) {
			return player === 2 ? "#ffaaaa" : "#ffffdd";
		} else {
			return player === 2 ? "#ff3333" : "#ffff00";
		}
	}

	async render(model) {
		this.setRect(50, 50, 400, 400);
		this.setDimensions(model.board.width, model.board.height);
		this.clear();

		const isGameOver = model.gameOver();
		if (isGameOver) {
			this.backgroundColor("#ffdddd");
		}

		//	Bottom layer
		const playerTurn = model.isHumanPlayer(model.turn);

		if (model.turn === 1) {
			this.drawTurn(475, 400, 10, model.turn);
		} else {
			this.drawTurn(475, 100, 10, model.turn);			
		}

		const selected = model.selectedCell;
		const cellUnderMouse = model.hoveredCell;
		const cellHighlighted = selected || cellUnderMouse;
		let possiblePath = null;

		const moves = {};
		if (playerTurn && model.unitCanPlay(cellHighlighted) && model.board.possibleMoves(cellHighlighted, moves)) {
			this.highlight(cellHighlighted, "hovered");
			for (let move in moves) {
				const [from, to] = fromTo(move);
				this.highlight(to, "possible-move");
				if (to === cellUnderMouse) {
					possiblePath = moves[move];
				}
			}
		}

		const unitHovered = model.board.getCellAtId(cellUnderMouse);

		this.drawGrid(true);

		// const totalCoverage = {};
		// model.board.getTotalCoverage(model.turn, totalCoverage);
		// for (let move in totalCoverage) {
		// 	const [from, to] = fromTo(move);
		// 	const { x, y } = id2location(to);
		// 	const unit = morel.board.getCell(x, y);
		// 	if (!unit || unit.player !== model.turn) {
		// 		this.drawCircle(x, y, .5, "#FFf5f5");
		// 		this.drawCircle(x, y, .3, "#FFeedd");
		// 	}
		// }


		const totalThreats = {};
		if (playerTurn) {
			model.board.getTotalCoverage(opponentTurn(model.turn), totalThreats);
			for (let move in totalThreats) {
				const [from, to] = fromTo(move);
				const { x, y } = id2location(to);
				const unit = model.board.getCell(x, y);
				if (!unit || unit.player !== model.turn) {
					this.drawCircle(x, y, .5, isGameOver ? "#FFeedd" : "#eeFFdd");
					this.drawCircle(x, y, .3, isGameOver ? "#FFdddd" : "#ddFFdd");
				}
				if (unit && unit.player === model.turn && unit.king) {
					this.highlight(to, "threatened");
				}
			}
		}


		if (possiblePath) {
			this.drawPath(possiblePath);
		}


		//	Top layer

		const threats = {};
		const selectedUnit = model.board.getCellAtId(cellHighlighted);
		if (selectedUnit && selectedUnit.player === model.turn) {
			if (model.board.getThreats(cellHighlighted, model.turn, threats)) {
				for (let move in threats) {
					const [from, to] = fromTo(move);
					this.boldCell(from, "#00aa00")
				}			
			}
		}

		if (selected) {
			this.boldCell(selected);
			if (possiblePath) {
				this.boldCell(cellUnderMouse);
			}
		}

		for (let y = 0; y < model.board.height; y++) {
			for (let x = 0; x < model.board.width; x++) {
				const unit = model.board.getCell(x, y);
				if (unit) {
					const { player, num, king, pawn } = unit;
					const direction = model.board.getPlayerDirection(player);
					if (pawn) {
						this.drawTriangle(x, y, player, direction);
					} else if (king) {
						this.drawRect(x, y, player);
					} else {
						this.drawUnit(x, y, player);
					}
					const offset = !pawn ? 0 : direction * -.1;
					this.drawText(x, y + offset, num, '30px serif', "#000000");
				}
			}
		}

		for (let move in totalThreats) {
			const [from, to] = fromTo(move);
			const { x, y } = id2location(to);
			const unit = model.board.getCell(x, y);
			if (unit && unit.player === model.turn) {
				this.drawText(x+.35, y-.25, "!", '16px serif bold', "#00aa00");
			}
		}

		if (isGameOver) {
			this.drawText(model.board.width / 2 - 1, -1.2, "game over", "20px serif", "#880000");			
			this.drawText(model.board.width - 2, -1.5, model.countMoves() + " moves", "10px serif", "#880000");			
			const label = "[ restart ]";
			this.drawButton("restart", label, "20px serif", model.hoveredButton === "restart" ? "#3333FF" : "#888888", "bottom")
		} else if (playerTurn && model.previousModel) {
			const label = "[ undo ]";
			this.drawButton("undo", label, "20px serif", model.hoveredButton === "undo" ? "#3333FF" : "#888888", "bottom")
		}

		this.drawButton("player1", model.isHumanPlayer(1) ? "[ human ]" : "[ cpu ]", "20px serif", model.hoveredButton === "player1" ? "#3333FF" : "#888888", "bottomright");
		this.drawButton("player2", model.isHumanPlayer(2) ? "[ human ]" : "[ cpu ]", "20px serif", model.hoveredButton === "player2" ? "#3333FF" : "#888888", "topright");

		this.setCursor(playerTurn && unitHovered && unitHovered.player === model.turn || model.hoveredButton ? "pointer" : "auto");

		model.iterateModels(({nextMove}, index) => {
			if (index < 15) {
				this.drawText(8.5, index / 2, nextMove, "20px serif", index < 13 ? "#888888" : index < 14 ? "#aaaaaa" : "#dddddd");
			}
		});

		if (!model.board.isLegalBoard(model.turn)) {
			this.drawText(model.board.width / 2 - 1.5, -1.2, "invalid board", "20px serif", "#880000");			
		}
	}
}