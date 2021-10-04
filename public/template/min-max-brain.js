class MinMaxBrain extends Brain {
	constructor(depth) {
		super(20);
		this.thoughts = [];
		this.seenModel = {};
		this.root = null;
		this.move = null;
		this.depth = depth || 3;
	}

	chooseMove(model) {
		if (model.isHumanPlayer(model.turn)) {
			if (this.thoughts) {
				this.thoughts = [];
				this.seenModel = {};
				this.root = null;
		this.move = null;
			}
			return null;
		}

		return this.move;
	}

	think(model) {
		if (model.isHumanPlayer(model.turn)) {
			if (this.thoughts) {
				this.thoughts = [];
				this.seenModel = {};
				this.root = null;
				this.move = null;
			}
			return;
		}


		if (!this.seenModel[model.id]) {
			this.seenModel[model.id] = model;
			this.thoughts.push(this.root = {
				player: model.turn,
				move: null,
				moves: [],
				model,
				depth: 0,
				children: [],
			});
		}

		this.processThoughts();
	}

	calculateBestMove(thought) {
		if (!thought.children.length) {
			return {
				move: thought.move,
				score: thought.score,
			};
		}
		const turn = thought.model.turn;
		let bestScore = turn === this.root.player ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		let bestMove = null;
		thought.children.forEach(thought => {
			const move = this.calculateBestMove(thought);
			if (turn === this.root.player) {
				if (move.score > bestScore) {
					bestScore = move.score;
					bestMove = thought.move;
				}
			} else {
				if (move.score < bestScore) {
					bestScore = move.score;
					bestMove = thought.move;
				}
			}
		});
		return {
			move: bestMove,
			score: bestScore,
		};
	}

	processThoughts() {
		if (this.move) {
			return;
		}
		const topModel = this.thoughts[0];
		if (topModel) {
			if (topModel.depth >= this.depth) {
				if (!this.move) {
					const thought = this.calculateBestMove(this.root);
					this.move = thought.move;
					console.log(thought.move, thought.score);
				}
				return;
			}

			this.thoughts.shift();
			const { model } = topModel;
			const moves = model.getMoves();
			moves.forEach(move => {
				const newModel = model.clone();
				newModel.performMove(move);
				const score = model.getScore(this.root.player);
				const newThought = {
					score,
					move: topModel.move || move,
					moves: topModel.moves.concat([move]),
					model: newModel,
					depth: topModel.depth + 1,
					parent: topModel,
					children: [],
				};
				this.thoughts.push(newThought);
				topModel.children.push(newThought);
			});
		}
	}
}