class Renderer {
	constructor() {
		this.canvas = this.createCanvas();
		this.dimensions = [1, 1];
		this.rect = { x:0, y:0, width:this.canvas.width, height:this.canvas.height };
		this.mouse = { x: 0, y: 0 };
		this.ctx = this.canvas.getContext("2d");
	}

	render(model) {
		console.log(`Render.`);
	}

	createCanvas() {
		const canvas = document.createElement("canvas");
		canvas.width = 650;
		canvas.height = 500;
		canvas.style.border = "1px solid black";
		document.body.appendChild(canvas);
		return canvas;
	}

	setCursor(cursor) {
		const { canvas }= this;
		if (canvas.style.cursor !== cursor) {
			canvas.style.cursor = cursor;
		}
	}

	clear() {
		this.buttons.length = 0;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	setMouse(pageX, pageY, model) {
		const x = pageX - this.canvas.offsetLeft, y = pageY - this.canvas.offsetTop;
		this.mouse.x = x;
		this.mouse.y = y;
	}

	click(pageX, pageY, model) {
	}

	setRect(x, y, width, height) {
		this.rect = {
			x, y, width, height,
		};
	}

	setDimensions(cols, rows) {
		this.dimensions = [cols, rows];
	}
}