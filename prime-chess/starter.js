window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new PrimeChessModel();
	const renderer = new PrimeChessRenderer();

	engine.init(model, renderer);
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
});
