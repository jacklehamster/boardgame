class UnstableRenderer extends GridRenderer {
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

	click(x, y, model) {
		super.click(x, y, model);
		model.click(this.getCellUnderMouse());
		return true;
	}

	async render(model) {
		this.setRect(50, 50, 400, 400);
		this.setDimensions(8, 8);
		this.clear();
		await this.drawBoard();
		this.drawGrid();

		const selected = model.selectedCell;
		const cellUnderMouse = model.hoveredCell;
		const cellHighlighted = selected || cellUnderMouse;
		let possiblePath = null;

		const moves = {};

		if (model.unitCanPlay(cellHighlighted) && model.board.possibleMoves(cellHighlighted, moves)) {
			for (let move in moves) {
				const [from, to] = fromTo(move);
				this.boldCell(to, "#00aa00");
				this.highlight(to, "possible-move-2");
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

		if (selected) {
			this.boldCell(selected);
			if (possiblePath) {
				this.boldCell(cellUnderMouse);
			}
		}
	}
}