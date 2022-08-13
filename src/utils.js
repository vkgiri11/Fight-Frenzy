// a function to detect collision
function rectangularCollision({ rectangle1, rectangle2 }) {
	// if the attack box of rect1 is inside of the rect2 body
	return (
		rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
		rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
		rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
	);
}

// a function to determine winner and show it to screen
function determineWinner({ player, enemy, timerId }) {
	// stops the timer when a winner is decided
	// in case where the player kills before timer runs to 0
	clearTimeout(timerId);

	document.querySelector('#matchResult').style.display = 'flex';
	if (player.health === enemy.health) {
		document.querySelector('#matchResult').innerHTML = 'Draw';
	} else if (player.health >= enemy.health) {
		document.querySelector('#matchResult').innerHTML = 'Player Wins';
	} else {
		document.querySelector('#matchResult').innerHTML = 'Enemy Wins';
	}
}

// a function for that implements timer and determines the winner based on time
let timer = 60;
let timerId;
function countdown() {
	if (timer > 0) {
		// decreases the timer every second
		timerId = setTimeout(countdown, 1000);
		timer--;
		document.querySelector('#timer').innerHTML = timer;
	} else {
		// when timer ends or becomes 0, show the match result
		determineWinner({ player, enemy, timerId });
	}
}