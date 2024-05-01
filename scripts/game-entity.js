class GameEntity {
  constructor(x, y, w, h, color, border = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h || w; // same as width if is not defined

    this.color = color || 'white';
    this.border = {
      color: border.color || 'black',
      width: border.width || 0
    }
  }

  render(ctx) {
    ctx.setTransform(1, 0, 0, 1, this.x, this.y);
    ctx.globalAlpha = this.opacity || 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.w, this.h);

    if (this.border.width) {
      ctx.beginPath();
      ctx.lineWidth = this.border.width;
      ctx.strokeStyle = this.border.color;
      ctx.rect(0, 0, this.w, this.h);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  update(dt) {}
}
