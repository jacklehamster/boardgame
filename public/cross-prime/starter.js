window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new CrossPrimeModel();
	const renderer = new CrossPrimeRenderer();
	const brain = new MinMaxBrain(2, 200);

	engine.init(model, renderer, brain);
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
	window.brain = brain;
});
