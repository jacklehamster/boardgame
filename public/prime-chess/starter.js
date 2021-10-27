window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new PrimeChessModel();
	const renderer = new PrimeChessRenderer();
	const brain = new MinMaxBrain(2, 200);

	engine.init(model, renderer, brain, new ShallowBrain());
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
	window.brain = brain;
});
