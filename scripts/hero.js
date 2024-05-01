class Hero extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y, w, h, '#EBF2FA', {
      color: '#05668D',
      width: 2
    });

    this.impulsing = false;
    this.impulse = 0.0;
    this.jumping = false;
    this.velocityY = 0.0;
    this.landingHit = 0;
  }

  jump() {
    this.impulsing = false;

    if (!this.jumping && this.impulse < -3) {
      this.jumping = true;
      this.velocityY = this.impulse;
    }

    this.impulse = 0.0;
  }

  render(ctx) {
    //modify hero properties just for render and reset later
    const realX = this.x;
    const realY = this.y;
    const realW = this.w;
    const realH = this.h;

    const heightDistortion = this.impulse || this.landingHit;
    const widthDistortion = heightDistortion/3;

    this.x = this.x + widthDistortion/2;
    this.y = this.y - heightDistortion;
    this.w = this.w - widthDistortion;
    this.h = this.h + heightDistortion;

    // call parent render function
    super.render(ctx);

    // draw eyes
    ctx.fillStyle = '#EBF2FA';
    ctx.fillRect(this.x + this.w - 8, this.y + this.h - 11, 6, 5);

    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + this.w - 4, this.y + this.h - 10, 1, 3);
    ctx.fillRect(this.x + this.w - 7, this.y + this.h - 10, 1, 3);
    
    //reset
    this.x = realX;
    this.y = realY;
    this.w = realW;
    this.h = realH;
  }

  update(dt, gravity, floor) {
    // apply gravity over our hero all the time
    this.velocityY += gravity;
    this.y += this.velocityY;

    // land on the floor
    if (this.y + this.h >= floor) {
      if (this.jumping) this.landingHit = this.velocityY * -1;

      this.jumping = false;
      this.velocityY = 0.0;
      this.y = floor - this.h - 1;
    }
  
    if (this.impulsing) {
      this.impulse -= dt * 10;

      if (this.impulse < -12.0) {
        this.impulse = -12.0;
      }
    }

    if (this.landingHit < 0) {
      this.landingHit += dt * 70;

      if (this.landingHit > 0) this.landingHit = 0;
    }
  }
}
