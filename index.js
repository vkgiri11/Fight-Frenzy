const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// size of canvas
canvas.width = 1024;
canvas.height = 576;

// fill the canvas with a black bg
c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
	position: {
		x: 0,
		y: 0,
	},
	imageSrc: './assets/background.png',
});

const shop = new Sprite({
	position: {
		x: 600,
		y: 128,
	},
	imageSrc: './assets/shop.png',
	scale: 2.75,
	framesMax: 6,
});

const player = new Fighter({
	position: {
		x: 50,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	imageSrc: './assets/samuraiMack/Idle.png',
	framesMax: 8,
	scale: 2.5,
	offset: {
		x: 215,
		y: 157,
	},
	sprites: {
		idle: {
			imageSrc: './assets/samuraiMack/Idle.png',
			framesMax: 8,
		},
		run: {
			imageSrc: './assets/samuraiMack/Run.png',
			framesMax: 8,
		},
		jump: {
			imageSrc: './assets/samuraiMack/Jump.png',
			framesMax: 2,
		},
		fall: {
			imageSrc: './assets/samuraiMack/Fall.png',
			framesMax: 2,
		},
		attack1: {
			imageSrc: './assets/samuraiMack/Attack1.png',
			framesMax: 6,
		},
		takeHit: {
			imageSrc: './assets/samuraiMack/Take Hit.png',
			framesMax: 4,
		},
		death: {
			imageSrc: './assets/samuraiMack/Death.png',
			framesMax: 6,
		},
	},
	attackBox: {
		offset: {
			x: 100,
			y: 50,
		},
		width: 160,
		height: 50,
	},
});

const enemy = new Fighter({
	position: {
		x: canvas.width - 100,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	color: 'blue',
	imageSrc: './assets/kenji/Idle.png',
	framesMax: 4,
	scale: 2.5,
	offset: {
		x: 215,
		y: 167,
	},
	sprites: {
		idle: {
			imageSrc: './assets/kenji/Idle.png',
			framesMax: 4,
		},
		run: {
			imageSrc: './assets/kenji/Run.png',
			framesMax: 8,
		},
		jump: {
			imageSrc: './assets/kenji/Jump.png',
			framesMax: 2,
		},
		fall: {
			imageSrc: './assets/kenji/Fall.png',
			framesMax: 2,
		},
		attack1: {
			imageSrc: './assets/kenji/Attack1.png',
			framesMax: 4,
		},
		takeHit: {
			imageSrc: './assets/kenji/Take hit.png',
			framesMax: 3,
		},
		death: {
			imageSrc: './assets/kenji/Death.png',
			framesMax: 7,
		},
	},
	attackBox: {
		offset: {
			x: -170,
			y: 50,
		},
		width: 165,
		height: 50,
	},
});

const keys = {
	a: { pressed: false },
	d: { pressed: false },
	ArrowRight: { pressed: false },
	ArrowLeft: { pressed: false },
};

// timer
countdown();

// an infinte recursion function
function animate() {
	window.requestAnimationFrame(animate);

	// fill the canvas with black bg, and clear everything before update
	c.fillStyle = 'black';
	c.fillRect(0, 0, canvas.width, canvas.height);

	background.update();
	shop.update();
	// adds a white bg between background and layers for better contrast
	c.fillStyle = 'rgba(255, 255, 255, 0.15)';
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.update();
	enemy.update();

	// player movements ->
	// stop the player from moving first and then move according to keys pressed
	player.velocity.x = 0;

	// if both keys are pressed, move in the direction of last key pressed
	if (keys.a.pressed && player.lastKeyPressed === 'a') {
		// moves the player back
		player.velocity.x = -5;
		player.switchSprite('run');
	} else if (keys.d.pressed && player.lastKeyPressed === 'd') {
		// moves the player front
		player.velocity.x = 5;
		player.switchSprite('run');
	} else {
		player.switchSprite('idle');
	}

	// jumping
	if (player.velocity.y < 0) {
		player.switchSprite('jump');
	} else if (player.velocity.y > 0) {
		// falling
		player.switchSprite('fall');
	}

	// enemy movements ->
	enemy.velocity.x = 0;
	if (keys.ArrowLeft.pressed && enemy.lastKeyPressed === 'ArrowLeft') {
		enemy.velocity.x = -5;
		enemy.switchSprite('run');
	} else if (keys.ArrowRight.pressed && enemy.lastKeyPressed === 'ArrowRight') {
		enemy.velocity.x = 5;
		enemy.switchSprite('run');
	} else {
		enemy.switchSprite('idle');
	}

	// jumping
	if (enemy.velocity.y < 0) {
		enemy.switchSprite('jump');
	} else if (enemy.velocity.y > 0) {
		// falling
		enemy.switchSprite('fall');
	}

	// detect for player attack and enemy gets hit ->
	if (
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy,
		}) &&
		player.isAttacking &&
		player.framesCurrent === 4
	) {
		enemy.takeHit();
		player.isAttacking = false;

		// document.querySelector('#enemyHealth').style.width = enemy.health + '%';
    // animate the decrease in health using gsap
    gsap.to('#enemyHealth', {
      width : enemy.health + '%'
    })
	}

	// player misses ->
	if (player.isAttacking && player.framesCurrent === 4) {
		player.isAttacking = false;
	}

	// detect for enemy attack and player gets hit ->
	if (
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player,
		}) &&
		enemy.isAttacking &&
		enemy.framesCurrent === 2
	) {
		player.takeHit();
		enemy.isAttacking = false;

		// document.querySelector('#playerHealth').style.width = player.health + '%';
    gsap.to('#playerHealth', {
      width : player.health + '%'
    })
	}

	// enemy misses ->
	if (enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false;
	}

	// ends the game based on the health
	if (enemy.health <= 0 || player.health <= 0) {
		determineWinner({ player, enemy, timerId });
	}
}
animate();

window.addEventListener('keydown', (event) => {
	if (!player.dead && !enemy.dead) {
		switch (event.key) {
			case 'd':
				keys.d.pressed = true;
				player.lastKeyPressed = 'd';
				break;

			case 'a':
				keys.a.pressed = true;
				player.lastKeyPressed = 'a';
				break;

			case 'w':
				// once the player jumps, it will automatically fall down due to gravity
				player.velocity.y = -20;
				break;

			case 's':
				player.attack();
				break;

			case 'ArrowRight':
				keys.ArrowRight.pressed = true;
				enemy.lastKeyPressed = 'ArrowRight';
				break;

			case 'ArrowLeft':
				keys.ArrowLeft.pressed = true;
				enemy.lastKeyPressed = 'ArrowLeft';
				break;

			case 'ArrowUp':
				enemy.velocity.y = -20;
				break;

			case 'ArrowDown':
				enemy.attack();
				break;
		}
	}
});

window.addEventListener('keyup', (event) => {
	// players key events
	switch (event.key) {
		case 'd':
			keys.d.pressed = false;
			break;

		case 'a':
			keys.a.pressed = false;
			break;
	}

	//enemy key events
	switch (event.key) {
		case 'ArrowRight':
			keys.ArrowRight.pressed = false;
			break;

		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false;
			break;
	}
});
