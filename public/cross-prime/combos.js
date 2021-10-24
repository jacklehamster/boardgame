class CrossPrimeCombos {
	constructor(count, max) {
		this.count = count;
		this.max = max || count * count;
		this.scoreMap = this.calculateScoreMap();
	}

	calculatePrimeCombos() {
		const primes = [];
		this.recursiveFindPrimes(0, this.count, 1, primes, []);
		return primes;
	}

	calculateScoreMap() {
		const primeCombos = this.calculatePrimeCombos();
		const map = {};
		primeCombos.forEach(entry => {
			const [prime, ...nums] = entry;
			this.fillMap(prime, nums, map);
		});
		return map;
	}

	fillMap(prime, nums, map) {
		if (nums.length === 0) {
			return;
		}
		const key = nums.join(",");
		// if (!map[key]) {
		// 	map[key] = [];
		// }
		// map[key].push(prime);
		map[key] = (map[key]||0) + prime;
		for (let i = 0; i < nums.length; i++) {
			this.fillMap(prime, nums.slice(0, i).concat(nums.slice(i+1)), map);
		}
	}

	// 1, 2, 3, 4, 5, 6, 7, 8, 9
	//	1, 2, 3
	//	1, 3, 4
	//	1, 4, 5
	//	...
	//	2, 3, 4
	//	2, 4, 5

	recursiveFindPrimes(total, numsRemaining, first, primes, nums) {
		if (!numsRemaining) {
			if (isPrime(total)) {
				primes.push([total].concat(nums));
			}
			return;
		}
		for (let i = first; i <= this.max; i++) {
			this.recursiveFindPrimes(total + i, numsRemaining - 1, i + 1, primes, nums.concat([i]));
		}
	}
}
