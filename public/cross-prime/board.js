class Board extends Board2d {
	constructor() {
		super(3, 3);
		this.nextNumber = 1;
	}

	copy(board) {
		super.copy(board);
		this.nextNumber = board.nextNumber;
	}

	move(cell, returnUndo) {
		const loc = id2location(cell);

		let undo = null;

		if (loc) {
			const preNum = this.nextNumber;
			if (returnUndo) {
				const restoreFrom = JSON.parse(JSON.stringify(fromUnit));
				const restoreTo = JSON.parse(JSON.stringify(toUnit));
				undo = () => {
					this.setCell(loc.x, loc.y, null);
					this.nextNumber = preNum;
				};
			}

			this.setCell(loc.x, loc.y, this.nextNumber);
			this.nextNumber++;
		}
		return undo;
	}

	getPrimeScores() {
		const primes = [null, [], [], [], []];
		for (let x = 0; x < this.width; x++) {
			primes[1].push(0);
			primes[3].push(0);
		}
		for (let y = 0; y < this.height; y++) {
			primes[2].push(0);
			primes[4].push(0);
		}

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const unit = this.getCell(x, y);
				if (unit) {
					primes[1][x] += unit;
					primes[2][y] += unit;
					primes[3][x] ++;
					primes[4][y] ++;
				}
			}
		}
		return primes;
	}
}