class Model {
	init() {
		console.log("init.");
	}

	render(renderer) {
		console.log(`Render.`);
	}

	play(model, action) {
		console.log(`Update model. Action: ${action}. This needs to return a new Model.`);
		return null;
	}
}