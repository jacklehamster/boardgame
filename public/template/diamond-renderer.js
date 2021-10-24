class DiamondRenderer extends Renderer {
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
			const {id, text, x, y, width, height} = this.buttons[i];
			if (mouse.x >= x && mouse.x <= x + width && mouse.y >= y && mouse.y <= y + height) {
				return id;
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

	drawButton(id, text, font, color, loc) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const string = "" + text;
		ctx.fillStyle = color || "#000000";
		ctx.font = font || '30px serif';
		const ox = x + (loc.indexOf("left") >= 0 ? -30 : loc.indexOf("right") >= 0 ? width + 30 : width / 2 - 30);
		const oy = y + (loc.indexOf("top") >= 0 ? -30 : loc.indexOf("bottom") >= 0 ? height + 30 : height / 2 - 30);
		ctx.fillText(string, ox, oy);

		const box = [ox - 8, oy - 20, 90, 30]
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#fefefe"
		ctx.beginPath();
		ctx.rect(box[0], box[1], box[2], box[3]);
		ctx.stroke();

		this.buttons.push({
			id,
			text,
			x : box[0],
			y: box[1],
			width: box[2],
			height: box[3],
		});
	}

	drawGrid(includeLegend) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#666666";
		for (let r = 0; r < rows + 1; r++) {
			ctx.moveTo(x + r / 2 * width / rows, y + r / 2 * height / rows + height / 2);
			ctx.lineTo(x + r / 2 * width / rows + width / 2, y + r / 2 * height / rows);
		}
		for (let c = 0; c < cols + 1; c++) {
			ctx.moveTo(x + c / 2 * width / cols, y - c / 2 * height / cols + height / 2);
			ctx.lineTo(x + c / 2 * width / cols + width / 2, y - c / 2 * height / cols + height);
		}
		ctx.stroke();

		if (includeLegend) {
			ctx.fillStyle = "#888888";
			ctx.font = '16px serif';
			for (let r = 0; r < rows; r++) {
				ctx.fillText('' + (r+1), x - 10 + (r + .5) / 2 * width / rows, y + (r + .8) / 2 * height / rows + 3 + height / 2);
			}
			for (let c = 0; c < cols; c++) {
				ctx.fillText(String.fromCharCode('A'.charCodeAt(0) + c), x + (c + .3) / 2 * width / cols - 5, y - 8 - (c + .4) / 2 * height / cols + height / 2);
			}
		}
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
		const diamondPath = [
			[0, 0],
			[1 / 2 * width / cols, -1 / 2 * height / rows],
			[2 / 2 * width / cols, 0],
			[1 / 2 * width / cols, +1 / 2 * height / rows],
		];

		const px = x + (loc.x) / 2 * width / cols + (loc.y) / 2 * width / rows;
		const py = y + (loc.y) / 2 * height / rows - (loc.x) / 2 * height / cols + height / 2;

		ctx.moveTo(px + diamondPath[diamondPath.length-1][0], py + diamondPath[diamondPath.length-1][1]);
		diamondPath.forEach(([x,y]) => ctx.lineTo(px + x, py + y));
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	drawUnit(cellId, unit) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const loc = id2location(cellId);
		const px = (unit < 10 ? 32 : 25) + x + (loc.x) / 2 * width / cols + (loc.y) / 2 * width / rows;
		const py = 8 + y + (loc.y) / 2 * height / rows - (loc.x) / 2 * height / cols + height / 2;
		ctx.fillStyle = "#000000";
		ctx.font = '30px serif';
		ctx.fillText(unit, px, py);
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

	getCellUnderMouse() {
		const { ctx, mouse } = this;
		const { x, y, width, height } = this.rect;
		if (mouse.x < x || mouse.x > x + width || mouse.y < y || mouse.y > y + height) {
			return null;
		}
		const [cols, rows] = this.dimensions;
		const cellWidth = width / cols, cellHeight = height / rows;

		const mx = mouse.x - x;
		const my = mouse.y - y;

		const px = Math.floor((mx - my + height / 2) / cellWidth),
				py = Math.floor((my + mx - height / 2) / cellHeight);
		if (px < 0 || px >= cols || py < 0 || py >= rows) {
			return null;
		}
		return location2id(px, py);
	}

	drawLines(points, lineWidth, color) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;

		ctx.globalAlpha = 0.4;

		ctx.lineWidth = lineWidth || 30;
		ctx.strokeStyle = color || "#ddeeFF";
		ctx.beginPath();

		points.forEach(([x,y],index) => {
			if (index === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});


		ctx.stroke();

		ctx.globalAlpha = 1;
	}

	drawPathThrough() {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const precess = 20;
		const excess = 15;

		for (let r = 0; r < rows; r++) {
			const px = x - 15 + (r + .5) / 2 * width / rows;
			const py = y + (r + .8) / 2 * height / rows + 5 + height / 2;
			this.drawLines([
				[px - 400 + precess, py - precess],
				[px + precess, py - precess],
				[px + width / 2 + excess, py - height / 2 - excess],
				[px + width / 2 + excess + 400, py - height / 2 - excess],
			]);
		}

		for (let c = 0; c < cols; c++) {
			const px = x + (c + .3) / 2 * width / cols - 5;
			const py = y + 17 - (c + .4) / 2 * height / cols + height / 2
			this.drawLines([
				[px - 400 + precess, py - precess],
				[px + precess, py - precess],
				[px + width / 2 + excess, py + height / 2 - excess],
				[px + width / 2 + excess + 400, py + height / 2 - excess],
			], null, "#ffeedd");
		}
	}

	drawPrimesScore(primes1, primes2, count1, count2) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const precess = 20;
		const excess = 15;
		ctx.font = '16px serif';
		const scores = [,0, 0];
		for (let r = 0; r < rows; r++) {
			ctx.fillStyle = count2[r] !== cols ? "#aaaaFF" : isPrime(primes2[r]) ? "#00aa00" : "#880000";
			ctx.fillText(!primes2[r] ? ""
				: primes2[r] + (count2[r] !== cols ? ""
					: isPrime(primes2[r]) ? " prime"
					: " not prime"),
				x + 43 + (r + .5) / 2 * width / rows + width / 2,
				y + (r + .8) / 2 * height / rows - 5 + height / 2 - height / 2);
			if (count2[r] === cols && isPrime(primes2[r])) {
				scores[2] += primes2[r];
			}
		}
		for (let c = 0; c < cols; c++) {
			ctx.fillStyle = count1[c] !== rows ? "#ffaaaa" : isPrime(primes1[c]) ? "#00aa00" : "#880000";
			ctx.fillText(!primes1[c] ? ""
				: primes1[c] + (count1[c] !== rows ? ""
					: isPrime(primes1[c]) ? " prime"
					: " not prime"),
				x + 63 + (c + .3) / 2 * width / cols - 5 + width / 2,
				y + 3 - (c + .4) / 2 * height / cols + height / 2 + height / 2);
			if (count1[c] === rows && isPrime(primes1[c])) {
				scores[1] += primes1[c];
			}
		}
		this.drawText(500, 450, scores[1]);
		this.drawText(500, 50, scores[2]);
	}

	drawText(px, py, text, font, color) {
		const { ctx } = this;
		const { x, y, width, height } = this.rect;
		const [cols, rows] = this.dimensions;
		const string = "" + text;
		ctx.fillStyle = color || "#000000";
		ctx.font = font || '30px serif';
		ctx.fillText(string, px, py);
	}

	performAction(action) {
		console.log(`performAction("${action}")`)
	}
}
