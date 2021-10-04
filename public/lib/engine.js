class Engine {
	init(model, renderer, brain) {
		this.model = model;
		this.renderer = renderer;
		this.brain = brain || new Brain();
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
		this.render = async () => {
			const refresh = await this.renderer.render(this.model);
			if (refresh) {
				requestAnimationFrame(this.render);
			}
		};


		model.init();
		this.render();


		const interval = setInterval(() => this.brainThink(), this.brain.thinkPeriod);

		model.onSwitchTurn = () => this.brainThink();
	}

	brainThink() {
		this.brain.think(this.model);
		if (!this.model.isHumanPlayer(this.model.turn)) {
			const move = this.brain.chooseMove(this.model);
			if (move) {
				this.model.performMove(move);
				this.render();
			}
		}		
	}
}
