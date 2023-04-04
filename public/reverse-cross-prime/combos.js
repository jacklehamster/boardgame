class CrossPrimeCombos {
	constructor(count, max) {
		this.count = count;
		this.max = max || count * count;
		const keyToCode = {
			'': 0,
		};
		const primeCombos = this.calculatePrimeCombos(keyToCode);
		const scoreMap = this.calculateScoreMap(keyToCode, primeCombos);
		const keyToScore = this.calculateKeyToScore(scoreMap);
		const codeToScore = this.calculateCodeToScore(keyToScore, keyToCode);
		this.keyToScore = keyToScore;
		this.codeToScore = codeToScore;
		this.scoreMap = scoreMap;
	}

	calculatePrimeCombos(keyToCode) {
		const primes = [];
		this.recursiveFindPrimes(0, this.count, 1, primes, [], keyToCode);
		return primes;
	}

	calculateScoreMap(keyToCode, primeCombos) {
		const map = {};
		primeCombos.forEach(entry => {
			const [prime, nums, key, code] = entry;
			this.fillMap(entry, nums, map);
		});
		return map;
	}

	calculateCodeToScore(keyToScore, keyToCode) {
		const codeToScore = [];
		for (let key in keyToScore) {
			codeToScore[keyToCode[key]] = keyToScore[key];
		}
		return codeToScore;
	}

	calculateKeyToScore(scoreMap) {
		const keyToScore = {};
		for (let key in scoreMap) {
			const entries = scoreMap[key];
			let totalScore = 0;
			entries.forEach(([prime, nums, key, code]) => {
				totalScore += prime;
			});
			keyToScore[key] = totalScore / entries.length;
		}
		return keyToScore;
	}

	fillMap(entry, nums, map) {
		if (nums.length === 0) {
			map[''] = (map[''] || []);
			map[''].push(entry);
			return;
		}
		const key = nums.join(",");
		map[key] = (map[key]||[]);
		if (map[key].indexOf(entry) < 0) {
			map[key].push(entry);
		}
		for (let i = 0; i < nums.length; i++) {
			this.fillMap(entry, nums.slice(0, i).concat(nums.slice(i+1)), map);
		}
	}

	getScore(key) {
		return this.keyToScore[key];
	}

	// 1, 2, 3, 4, 5, 6, 7, 8, 9
	//	1, 2, 3
	//	1, 3, 4
	//	1, 4, 5
	//	...
	//	2, 3, 4
	//	2, 4, 5

	recursiveFindPrimes(total, numsRemaining, first, primes, nums, keyToCode) {
		keyToCode[nums.join(",")] = numCode(nums);
		if (!numsRemaining) {
			if (isPrime(total)) {
				primes.push([total].concat([nums]).concat([nums.join(",")]).concat([numCode(nums)]));
			} else {
				primes.push([0].concat([nums]).concat([nums.join(",")]).concat([numCode(nums)]));				
			}
			return;
		}
		for (let i = first; i <= this.max; i++) {
			this.recursiveFindPrimes(total + i, numsRemaining - 1, i + 1, primes, nums.concat([i]), keyToCode);
		}
	}
}
