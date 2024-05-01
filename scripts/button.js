class Button extends GameEntity {
  constructor(x, y, w, h, text) {
    super(x, y, w, h);

    this.text = text;
    this.state = 0;
  }

  render(ctx) {
    ctx.setTransform(1, 0, 0, 1, this.x, this.y);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, this.w, this.y);
    this.ctx.fillText(this.text, (this.w/2) - (ctx.measureText(this.text).width/2), this.h/2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}