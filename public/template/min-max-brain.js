class MinMaxBrain extends Brain {
	constructor(depth, iterations, period, method) {
		super(period || 10);
		this.thoughts = [];
		this.seenModel = {};
		this.root = null;
		this.move = null;
		this.depth = depth || 3;
		this.iterations = iterations || 10;
		this.method = method || "BFS";
	}

	clear() {
		this.thoughts = [];
		this.seenModel = {};
		this.root = null;
		this.move = null;		
	}

	chooseMove(model) {
		if (model.isHumanPlayer(model.turn)) {
			if (this.thoughts) {
				this.clear();
			}
			return null;
		}

		return this.move;
	}

	think(model) {
		if (model.isHumanPlayer(model.turn) || model.gameOver()) {
			if (this.thoughts) {
				this.clear();
			}
			return;
		}

		if (this.method === "DFS") {
			this.move = this.dfs(model, model.turn);
			return;
		}

		if (!this.seenModel[model.id]) {
			this.thoughtStart = new Date().getTime();
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

		const time = new Date().getTime();
		for (let i = 0; i < this.iterations; i++) {
			this.processThoughts();
			if (new Date().getTime() - time > 50) {
				break;
			}
		}
	}

	dfs(model, player) {
		const startTime = new Date().getTime();

		const newModel = model.clone();
		newModel.setValidateLegal(false);
		newModel.variant = player == 1;
		newModel.setSaveHistory(false);
		newModel.returnUndo = true;

		const moves = newModel.getMoves();
		if (moves.length === 1 || !newModel.thinkHard()) {
			return moves[Math.floor(Math.random() * moves.length)];
		}
		const turn = newModel.turn;
		let bestScore = turn === player ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		let bestMove = null;

		moves.forEach(move => {
			if (!newModel.isLegalMove(move)) {
				return;
			}
			const undo = newModel.performMove(move);
			const score = this.dfsHelper(newModel, 1, player);
			if (turn === player) {
				if (score > bestScore) {
					bestScore = score;
					bestMove = move;
				}
			} else {
				if (score < bestScore) {
					bestScore = score;
					bestMove = move;
				}
			}
			undo();
		});

		console.log(bestMove, bestScore, new Date().getTime() - startTime);

		return bestMove;
	}

	dfsHelper(model, depth, player) {
		if (depth >= this.depth || model.gameOver()) {
			return model.getScore(player);
		}

		const moves = model.getMoves();
		const turn = model.turn;
		let bestScore = turn === player ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

		moves.forEach(move => {
			const undo = model.performMove(move);
			const score = this.dfsHelper(model, depth + 1, player);
			if (turn === player) {
				if (score > bestScore) {
					bestScore = score;
				}
			} else {
				if (score < bestScore) {
					bestScore = score;
				}
			}
			undo();
		});
		return bestScore;
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
			const timeEllapsed = (new Date().getTime() - this.thoughtStart);
			if (topModel.depth >= this.depth || timeEllapsed >= 30000) {
				if (!this.move) {
					const thought = this.calculateBestMove(this.root);
					this.move = thought.move;
					console.log(this.root.player, thought.move, thought.score, timeEllapsed / 1000 + "s");
				}
				return;
			}

			this.thoughts.shift();
			const { model } = topModel;
			const moves = model.getMoves();
			if (moves.length === 1 || !model.thinkHard()) {
				this.move = moves[Math.floor(Math.random() * moves.length)];
				return;
			}


			moves.forEach(move => {
				const newModel = model.clone();
				newModel.setValidateLegal(false);
				newModel.variant = this.root.player == 1;
				newModel.setSaveHistory(false);
				newModel.performMove(move);
				if (newModel.gameOver()) {
					return;
				}
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