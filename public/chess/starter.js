window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new ChessModel();
	const renderer = new ChessRenderer();
	const brain = new MinMaxBrain(3, 100, 10);

	engine.init(model, renderer, brain);
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
	window.brain = brain;
});
