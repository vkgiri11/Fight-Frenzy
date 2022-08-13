// background related sprite ->
class Sprite {
	constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
		this.position = position;
		this.width = 50;
		this.height = 150;
		this.image = new Image();
		this.image.src = imageSrc;
		this.scale = scale;
		this.framesMax = framesMax;
		this.framesCurrent = 0;
		this.framesElapsed = 0;
		this.framesHold = 5;
		this.offset = offset;
	}

	draw() {
		// draws 'this.image' at the specified position
		// dimensions: original image dimensions multiplied by some scale

		// any moving image is a continous image of 'x' individual images, so we need to crop it to one image
		// and then loop over the 'x' of them so as to create a effect of animation

		// for static images like background, frameCurrent will be 0
		// for animated images we need to set frame Current
		c.drawImage(
			this.image,
			this.framesCurrent * (this.image.width / this.framesMax), // crop start x
			0, // crop start y
			this.image.width / this.framesMax, // crop width
			this.image.height, // crop height
			this.position.x - this.offset.x, // image start x
			this.position.y - this.offset.y, // image start y
			(this.image.width / this.framesMax) * this.scale, // image width
			this.image.height * this.scale // image height
		);
	}

	animateFrames() {
		this.framesElapsed++;

		// At every interval equal to framesHold we need to move the crop location
		if (this.framesElapsed % this.framesHold === 0) {
			// moves the crop location until it reaches the end
			// once it reaches the end move it back to starting
			// -1 so that our static images with framesMax=1 doesnt get effected
			if (this.framesCurrent < this.framesMax - 1) {
				this.framesCurrent++;
			} else {
				this.framesCurrent = 0;
			}
		}
	}

	update() {
		this.draw();
		this.animateFrames();
	}
}

class Fighter extends Sprite {
	constructor({
		position,
		velocity,
		color = 'red',
		imageSrc,
		scale = 1,
		framesMax = 1,
		offset = { x: 0, y: 0 },
		sprites,
		attackBox = { offset: {}, width: undefined, height: undefined },
	}) {
		// inherit these properties from parent class
		super({
			position,
			imageSrc,
			scale,
			framesMax,
			offset,
		});

		this.velocity = velocity;
		this.width = 50;
		this.height = 150;
		this.lastKeyPressed;
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			offset: attackBox.offset,
			width: attackBox.width,
			height: attackBox.height,
		};
		this.color = color;
		this.isAttacking;
		this.health = 100;
		this.framesCurrent = 0;
		this.framesElapsed = 0;
		this.framesHold = 5;
		this.sprites = sprites;
		this.dead = false;

		// attaches a image to every object in sprites
		for (const sprite in this.sprites) {
			sprites[sprite].image = new Image();
			sprites[sprite].image.src = sprites[sprite].imageSrc;
		}
	}

	// whenever this method is called, the player is redrawn at a new position
	update() {
		this.draw();

		// stop player animation once anyone dies
		if (!this.dead) this.animateFrames();

		// attack boxes
		this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
		this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

		// draw the attack box
		// c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		// if the bottom part of player touches the lower part of canvas
		// stop it from falling
		if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
			this.velocity.y = 0;
			// hard code the position of player
			this.position.y = 330.4;
		} else {
			// increases velocity over time - acceleration
			this.velocity.y += gravity;
		}
	}

	attack() {
		this.switchSprite('attack1');
		this.isAttacking = true;
	}

	takeHit() {
		this.health -= 20;

		if (this.health <= 0) {
			this.switchSprite('death');
		} else {
			this.switchSprite('takeHit');
		}
	}

	switchSprite(sprite) {
		// overrides all animation for death
		if (this.image === this.sprites.death.image) {
			if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;

			return;
		}

		// overrides all other animations with the attack animation
		if (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) return;

		// override when player gets hit
		if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;

		switch (sprite) {
			case 'idle':
				// it is changed just once
				if (this.image !== this.sprites.idle.image) {
					this.image = this.sprites.idle.image;
					this.framesMax = this.sprites.idle.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'run':
				if (this.image !== this.sprites.run.image) {
					this.image = this.sprites.run.image;
					this.framesMax = this.sprites.run.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'jump':
				if (this.image !== this.sprites.jump.image) {
					this.image = this.sprites.jump.image;
					this.framesMax = this.sprites.jump.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'fall':
				if (this.image !== this.sprites.fall.image) {
					this.image = this.sprites.fall.image;
					this.framesMax = this.sprites.fall.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'attack1':
				if (this.image !== this.sprites.attack1.image) {
					this.image = this.sprites.attack1.image;
					this.framesMax = this.sprites.attack1.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'takeHit':
				if (this.image !== this.sprites.takeHit.image) {
					this.image = this.sprites.takeHit.image;
					this.framesMax = this.sprites.takeHit.framesMax;
					this.framesCurrent = 0;
				}
				break;
			case 'death':
				if (this.image !== this.sprites.death.image) {
					this.image = this.sprites.death.image;
					this.framesMax = this.sprites.death.framesMax;
					this.framesCurrent = 0;
				}
				break;
		}
	}
}
