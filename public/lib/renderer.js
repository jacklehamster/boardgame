class Renderer {
	constructor() {
		this.canvas = this.createCanvas();
		this.rect = { x:0, y:0, width:this.canvas.width, height:this.canvas.height };
		this.mouse = { x: 0, y: 0 };
		this.ctx = this.canvas.getContext("2d");
		this.imageCache = {};
	}

	async render(model) {
		console.log(`Render.`);
	}

	async loadImage(src) {
		if (this.imageCache[src]) {
			return Promise.resolve(this.imageCache[src]);
		}
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener("load", () => {
				this.imageCache[src] = img;
				resolve(img);
			});
			img.addEventListener("error", e => {
				reject(e);
			});
			img.src = src;
		});
	}

	createCanvas() {
		const canvas = document.createElement("canvas");
		canvas.width = 600;
		canvas.height = 500;
		canvas.style.border = "1px solid black";
		const div = document.body.appendChild(document.createElement("div"));
		div.style.display = "flex";
		div.style.flexDirection = "row";
		div.appendChild(canvas);
		const instruction = div.appendChild(document.createElement("div"));
		div.appendChild(instruction);
		div.innerText = this.getInstructions();
		return canvas;
	}
	
	getInstructions() {
		return "";
	}

	setCursor(cursor) {
		const { canvas }= this;
		if (canvas.style.cursor !== cursor) {
			canvas.style.cursor = cursor;
		}
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	backgroundColor(color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
}
