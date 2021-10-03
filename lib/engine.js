class Engine {
	init(model, renderer) {
		this.model = model;
		this.renderer = renderer;
		document.addEventListener("mousemove", e => {
			if (this.renderer.setMouse(e.pageX, e.pageY, this.model)) {
				this.render();
			}
		});

		document.addEventListener("click", e => {
			if (this.renderer.click(e.pageX, e.pageY, this.model)) {
				this.render();
			}
		});

		const engine = this;
		this.render = () => {
			if (this.renderer.render(this.model)) {
				requestAnimationFrame(this.render);
			}
		};


		model.init();
		this.render();
	}
}
