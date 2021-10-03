class PrimeChessRenderer extends Renderer {
	constructor() {
		super();
		this.buttons = [];
	}

	setMouse(x, y, model) {
		super.setMouse(x, y, model);
		const cell = this.getCellUnderMouse();
		let shouldRender = false;
		if (model.hoveredCell !== cell) {
			model.hoveredCell = cell;
			shouldRender = true;
		}
		const button = this.getButtonUnderMouse();
		if (model.hoveredButton !== button) {
			model.hoveredButton = button;
			shouldRender = true;
		}
		return shouldRender;
	}

	click(x, y, model) {
		super.click(x, y, model);
		model.click(this.getCellUnderMouse(), this.getButtonUnderMouse());
		return true;
	}

	getButtonUnderMouse() {
		const { ctx, mouse } = this;
		for (let i = 0; i < this.buttons.length; i++) {
			const {text, x, y, width, height} = this.buttons[i];
			if (mouse.x >= x && mouse.x <= x + width && mouse.y >= y && mouse.y <= y + height) {
				return text;
			}
		}
		return null;
	}

	getCellUnderMouse() {
		const { ctx, mouse } = this;
		const { x, y, width, height } = this.rect;
		if (mouse.x < x || mouse.x > x + width || mouse.y < y || mouse.y > y + height) {
			return null;
		}
		const [cols, rows] = this.dimensions;
		const cellWidth = width / cols, cellHeight = height / rows;
		const px = Math.floor((mouse.x - x) / cellWidth),
				py = Math.floor((mouse.y - y) / cellHeight);
		if (px < 0 || px >= cols || py < 0 || py >= rows) {
			return null;
		}
		return location2id(px, py);
	}

	highlight(cellId, type) {
		if (!cellId) {
			return;
		}
		const loc = id2location(cellId);
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.beginPath();
		switch (type) {
			case "hovered":
				ctx.fillStyle = "#FFaa77";	
				break;
			case "possible-move":
				ctx.fillStyle = "#FFFFaa";	
				break;
			case "threatened":
				ctx.fillStyle = "#00aa00";
				break;	
			default:
				ctx.fillStyle = "#FFFF77";	
		}
		ctx.rect(x + (loc.x) * width / cols, y + (loc.y) * height / cols, width / cols, height / rows);
		ctx.fill();
	}

	boldCell(cellId, color) {
		if (!cellId) {
			return;
		}
		const loc = id2location(cellId);
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = color || "#000000";
		ctx.rect(x + (loc.x) * width / cols, y + (loc.y) * height / cols, width / cols, height / rows);
		ctx.stroke();
	}

	drawGrid(includeLegend) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#666666";
		for (let r = 0; r < rows + 1; r++) {
			ctx.moveTo(x, y + r * height / rows);
			ctx.lineTo(x + width, y + r * height / rows);
		}
		for (let c = 0; c < cols + 1; c++) {
			ctx.moveTo(x + c * width / cols, y);
			ctx.lineTo(x + c * width / cols, y + height);
		}
		ctx.stroke();

		ctx.fillStyle = "#888888";
		ctx.font = '16px serif';
		for (let r = 0; r < rows; r++) {
			ctx.fillText('' + (r+1), x - 15, y + (r + .5) * height / rows + 5);
		}
		for (let c = 0; c < cols; c++) {
			ctx.lineTo(x + c * width / cols, y + height);
			ctx.fillText(String.fromCharCode('A'.charCodeAt(0) + c), x + (c + .5) * width / cols - 5, y - 8);
		}
	}

	getPlayerColor(player, king) {
		if (king) {
			return player === 2 ? "#ffaaaa" : "#ffffdd";
		} else {
			return player === 2 ? "#ff3333" : "#ffff00";
		}
	}

	drawTurn(x, y, radius, player) {
		const { ctx } = this;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = this.getPlayerColor(player);
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();		
	}

	drawCircle(px, py, radius, color) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.fillStyle = color || "#000000";
		const cellSize = Math.min(width / cols, height / rows);
		ctx.beginPath();
		ctx.arc(x + (px + .5) * width / cols, y + (py + .5) * height / cols, cellSize / 2 * (radius || .5), 0, 2 * Math.PI);
		ctx.fill();
	}

	drawUnit(px, py, player) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = this.getPlayerColor(player);
		const cellSize = Math.min(width / cols, height / rows);
		ctx.beginPath();
		ctx.arc(x + (px + .5) * width / cols, y + (py + .5) * height / cols, cellSize / 2 * .8, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}

	drawPath(path) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;

		ctx.lineWidth = 10;
		ctx.strokeStyle = "#aaDDFF";
		ctx.beginPath();

		const steps = path.split("-");
		for (let i = 0; i < steps.length - 1; i++) {
			const fromId = steps[i];
			const toId = steps[i+1];
			const from = id2location(fromId);
			const to = id2location(toId);
			const fromX = x + (from.x + .5) * width / cols;
			const fromY = y + (from.y + .5) * height / rows;
			const toX = x + (to.x + .5) * width / cols;
			const toY = y + (to.y + .5) * height / rows;
			if (i == 0) {
				ctx.moveTo(fromX, fromY);
			}
			ctx.lineTo(toX, toY);
		}
		ctx.stroke();

		ctx.lineWidth = 5;
		ctx.strokeStyle = "#aaaaFF";
		ctx.stroke();
	}

	drawRect(px, py, player) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = this.getPlayerColor(player, true);
		const cellSize = Math.min(width / cols, height / rows);
		ctx.beginPath();
		ctx.rect(x + (px + .1) * width / cols, y + (py + .1) * height / cols, width / cols * .8, height / rows * .8);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.rect(x + (px + .2) * width / cols, y + (py + .2) * height / cols, width / cols * .6, height / rows * .6);
		ctx.stroke();
	}

	drawText(px, py, text, font, color) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const string = "" + text;
		ctx.fillStyle = color || "#000000";
		ctx.font = font || '30px serif';
		ctx.fillText(string, x + (px + .5) * width / cols - 7, y + (py + .5) * height / cols + 9);
	}

	drawButton(text, font, color) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const string = "" + text;
		ctx.fillStyle = color || "#000000";
		ctx.font = font || '30px serif';
		const ox = x + width / 2 - 30;
		const oy = y + height + 30;
		ctx.fillText(string, ox, oy);

		const box = [ox - 8, oy - 20, 80, 30]
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#fefefe"
		ctx.beginPath();
		ctx.rect(box[0], box[1], box[2], box[3]);
		ctx.stroke();

		this.buttons.push({
			text,
			x : box[0],
			y: box[1],
			width: box[2],
			height: box[3],
		});
	}

	drawTriangle(px, py, player, direction) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = this.getPlayerColor(player);
		const cellSize = Math.min(width / cols, height / rows);
		ctx.beginPath();
		if (direction >= 0) {
			ctx.moveTo(x + (px + .5) * width / cols, y + (py + .9) * height / cols);
			ctx.lineTo(x + (px + .1) * width / cols, y + (py + .1) * height / cols);
			ctx.lineTo(x + (px + .9) * width / cols, y + (py + .1) * height / cols);
			ctx.lineTo(x + (px + .5) * width / cols, y + (py + .9) * height / cols);
		} else {
			ctx.moveTo(x + (px + .5) * width / cols, y + (py + .1) * height / cols);
			ctx.lineTo(x + (px + .1) * width / cols, y + (py + .9) * height / cols);
			ctx.lineTo(x + (px + .9) * width / cols, y + (py + .9) * height / cols);
			ctx.lineTo(x + (px + .5) * width / cols, y + (py + .1) * height / cols);
		}
		ctx.fill();
		ctx.stroke();		
	}

	render(model) {
		this.setRect(50, 50, 400, 400);
		this.setDimensions(model.board.width, model.board.height);
		this.clear();

		//	Bottom layer

		if (model.turn === 1) {
			this.drawTurn(475, 400, 10, model.turn);
		} else {
			this.drawTurn(475, 100, 10, model.turn);			
		}

		const selected = model.selectedCell;

		const moves = {};
		const cellUnderMouse = model.hoveredCell;
		const cellHighlighted = selected || cellUnderMouse;
		let possiblePath = null;

		if (model.unitCanPlay(cellHighlighted) && model.board.possibleMoves(cellHighlighted, moves)) {
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

		this.drawGrid();

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
		model.board.getTotalCoverage(opponentTurn(model.turn), totalThreats);
		for (let move in totalThreats) {
			const [from, to] = fromTo(move);
			const { x, y } = id2location(to);
			const unit = model.board.getCell(x, y);
			if (!unit || unit.player !== model.turn) {
				this.drawCircle(x, y, .5, "#eeFFdd");
				this.drawCircle(x, y, .3, "#ddFFdd");
			}
			if (unit && unit.player === model.turn && unit.king) {
				this.highlight(to, "threatened");
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

		if (model.previousModel) {
			const label = "[ undo ]";
			this.drawButton(label, "20px serif", model.hoveredButton === label ? "#3333FF" : "#888888")
		}

		this.setCursor(unitHovered && unitHovered.player === model.turn || model.hoveredButton ? "pointer" : "auto");

		let line = 0;
		for (let m = model.previousModel; m; m = m.previousModel) {
			const { nextMove } = m;
			this.drawText(9.5, line / 2, nextMove, "20px serif", "#888888");
			line++;
		}

		if (!model.board.isLegalBoard(model.turn)) {
			this.drawText(model.board.width / 2 - 1.5, -1.2, "invalid board", "20px serif", "#880000");			
		}
	}
}