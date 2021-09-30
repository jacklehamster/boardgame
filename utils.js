function id2location(id) {
	if (!id) {
		return null;
	}
	const upperId = id.toUpperCase();
	return {
		x: id.charCodeAt(0) - 'A'.charCodeAt(0),
		y: id.charCodeAt(1) - '1'.charCodeAt(0),
	};
}

function location2id(x, y) {
	return String.fromCharCode('A'.charCodeAt(0) + x) + (y + 1);
}

function adjacent(fromLocation, toLocation) {
	return Math.abs(fromLocation.x - toLocation.x) + Math.abs(fromLocation.y - toLocation.y) === 1;
}

function opponentTurn(turn) {
	return 3 - turn;
}

function fromTo(move) {
	return move.split("-");
}