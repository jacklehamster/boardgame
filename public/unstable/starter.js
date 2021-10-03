window.addEventListener('DOMContentLoaded', (event) => {
	const engine = new Engine();
	const model = new UnstableModel();
	const renderer = new UnstableRenderer();

	engine.init(model, renderer);
	window.model = model;
	window.engine = engine;
	window.renderer = renderer;
});
