class GridRenderer extends Renderer {
	constructor() {
		super();
		this.dimensions = [1, 1];
		this.buttons = [];
	}

	clear() {
		super.clear();
		this.buttons.length = 0;
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

	click(x, y, model) {
		super.click(x, y, model);
		model.click(this.getCellUnderMouse(), this.getButtonUnderMouse());
		return true;
	}
	
	setDimensions(cols, rows) {
		this.dimensions = [cols, rows];
	}

	getRect(cellId) {
		if (!cellId) {
			return null;
		}
		const loc = id2location(cellId);
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		return [
			x + (loc.x) * width / cols,
			y + (loc.y) * height / cols,
			width / cols,
			height / rows,
		];
	}

	boldCell(cellId, color) {
		if (!cellId) {
			return;
		}
		const rect = this.getRect(cellId);
		if (!rect) {
			return;
		}
		const { ctx } = this;
		const [ x, y, width, height ] = rect;
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = color || "#000000";
		ctx.rect(x, y, width, height);
		ctx.stroke();
	}

	drawImage(cellId, image) {
		if (!cellId || !image) {
			return;
		}
		const rect = this.getRect(cellId);
		if (!rect) {
			return;
		}
		const { ctx } = this;
		const [ x, y, width, height ] = rect;
		ctx.drawImage(image, x, y, width, height);
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

		if (includeLegend) {
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

	highlight(cellId, type) {
		if (!cellId) {
			return;
		}
		const loc = id2location(cellId);
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.globalAlpha = 0.7;
		ctx.beginPath();
		switch (type) {
			case "hovered":
				ctx.fillStyle = "#FFaa77";	
				break;
			case "possible-move":
				ctx.fillStyle = "#FFFFaa";	
				break;
			case "possible-move-2":
				ctx.fillStyle = "#aaFFaa";	
				break;
			case "threatened":
				ctx.fillStyle = "#00aa00";
				break;	
			case "attacking":
				ctx.fillStyle = "#FF6666";
				break;	
			default:
				ctx.fillStyle = "#FFFF77";	
		}
		ctx.rect(x + (loc.x) * width / cols, y + (loc.y) * height / cols, width / cols, height / rows);
		ctx.fill();
		ctx.globalAlpha = 1;
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

	performAction(action) {
		console.log(`performAction("${action}")`)
	}
}