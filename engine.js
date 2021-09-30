class Engine {
	init(model, renderer) {
		this.model = model;
		this.renderer = renderer;

		model.init();
		this.render();

		document.addEventListener("mousemove", e => {
			this.renderer.setMouse(e.pageX, e.pageY);
			const cell = this.renderer.getCellUnderMouse();
			let shouldRender = false;
			if (this.model.hoveredCell !== cell) {
				this.model.hoveredCell = cell;
				shouldRender = true;
			}
			const button = this.renderer.getButtonUnderMouse();
			if (this.model.hoveredButton !== button) {
				this.model.hoveredButton = button;
				shouldRender = true;
			}
			if (shouldRender) {
				this.render();
			}
		});

		document.addEventListener("click", e => {
			this.model.click(this.renderer.getCellUnderMouse(), this.renderer.getButtonUnderMouse());
			this.render();
		});
	}

	render() {
		this.model.render(this.renderer);
	}
}


window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new PrimeChessModel();
	const renderer = new Renderer();

	engine.init(model, renderer);
	engine.render();
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
});
