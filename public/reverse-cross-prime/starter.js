window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new CrossPrimeModel();
	const renderer = new CrossPrimeRenderer();
	const brain = new MinMaxBrain(4, 200, "BFS");
	const dumbBrain = new RandomBrain();

	engine.init(model, renderer, brain);
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
	window.brain = brain;
});
