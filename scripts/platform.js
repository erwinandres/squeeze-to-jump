const colors = ['#A5BE00', '#a22c29', '#5bc0eb'];
const borders = ['#679436', '#5a1807', '#2e86ab'];

class Platform extends GameEntity {
  constructor(x, y, type = 0) {
    super(x, y, 40, 10, colors[type], {
      color: borders[type],
      width: 2
    });

    this.speed = 200;
    this.isLast = false;
    this.type = type; //0: normal, 1: disappearing, 2: moving
    this.activated = false; // switch when user lands
    this.activeTime = 0; // time since user land on this platform
    this.dead = false;
    this.opacity = 1;
  }

  render(ctx, debug) {
    if (this.dead) return;

    super.render(ctx);

    if (this.isLast && debug) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, 0);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
  }

  update(dt, move, worldSpeed) {
    /*if (move) {
      this.x -= worldSpeed * dt;
    }*/
    this.x -= worldSpeed * dt;
    
    if (this.activated) {
      this.activeTime += dt;

      if (this.type === 1) {
        //make it disappear
        this.opacity -= Math.max(dt * .6, 0);

          if (this.opacity <= 0) {
            this.dead = true;
          }
      } else if (this.type === 2) {
        // make it move
      }
    }
  }
}