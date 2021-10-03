class Model {
	init() {
		console.log("init.");
	}

	play(model, action) {
		console.log(`Update model. Action: ${action}. This needs to return a new Model.`);
		return null;
	}
}