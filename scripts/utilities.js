const requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(callback){
          window.setTimeout(callback, 1000 / 60);
      };
})();

/**
* Get random number.
* @param {number} min
* @param {number} max
* @param {number}
*/
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function degsToRads(degs) { return degs / (180/Math.PI) }
function radsToDegs (rads) { return rads * (180/Math.PI) }

function exponent(x, n) {
  return n === 0 ? 1 : x * exponent(x, n-1);
}

function pointInsideBox(x, y, box, sizeAdjustmentRatio) {
  const bX = box.x / sizeAdjustmentRatio;
  const bY = box.y / sizeAdjustmentRatio;
  const bW = box.w / sizeAdjustmentRatio;
  const bH = box.h / sizeAdjustmentRatio;

  return x > bX &&
      x < bX + bW &&
      y > bY &&
      y < bY + bH;
}

function renderEntity(ctx, entity, sizeAdjustmentRatio, sprite) {
  const a = degsToRads(entity.angle || 0);
  const aSin = Math.sin(a);
  const aCos = Math.cos(a);

  sizeAdjustmentRatio = sizeAdjustmentRatio || 1;
  sprite = sprite || entity.sprite;

  const scale = entity.scale || 1;
  const vFlip = entity.vFlip || 1;
  const hScale = scale * vFlip;
  const x = vFlip === -1 ? entity.x + (entity.w * scale) : entity.x;

  ctx.setTransform(aCos * (hScale / sizeAdjustmentRatio), aSin, -aSin, aCos * (scale / sizeAdjustmentRatio), Math.floor((x - (entity.w/2)) / sizeAdjustmentRatio), Math.floor((entity.y - (entity.h/2)) / sizeAdjustmentRatio));
  sprite.render(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function renderHitBox(ctx, box, sizeAdjustmentRatio, opacity) {
  const a = degsToRads(box.angle || 0);
  const aSin = Math.sin(a);
  const aCos = Math.cos(a);

  sizeAdjustmentRatio = sizeAdjustmentRatio || 1;

  const scale = box.scale || 1;
  const vFlip = box.vFlip || 1;
  const hScale = scale * vFlip;
  const x = vFlip === -1 ? box.x + (box.w * scale) : box.x;

  ctx.setTransform(aCos * (hScale / sizeAdjustmentRatio), aSin, -aSin, aCos * (scale / sizeAdjustmentRatio), x / sizeAdjustmentRatio, box.y / sizeAdjustmentRatio);

  opacity = typeof opacity === 'number' ? opacity : 0.5;
  const transparentLayerColor = `rgba(255, 255, 255, ${opacity})`;

  if (box.r) {
    ctx.beginPath();
    ctx.fillStyle = transparentLayerColor;
    ctx.strokeStyle = box.color;
    ctx.arc(0, 0, box.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else {
    if (opacity > 0) {
      ctx.fillStyle = box.color;
      ctx.fillRect(0, 0, box.w, box.h);
      ctx.fillStyle = transparentLayerColor;
      ctx.fillRect(0, 0, box.w, box.h);
    }

    ctx.strokeStyle = box.color;
    ctx.strokeRect(0, 0, box.w, box.h);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function getRelativeTouchCoords(element, event) {
  const bounds = element.getBoundingClientRect();

  const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
  const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

  return {
      x: clientX - bounds.left,
      y: clientY - bounds.top
  }
}

function boxToBoxCollision(boxA, boxB) {
  return boxA.x < boxB.x + boxB.w &&
    boxA.x + boxA.w > boxB.x &&
    boxA.y < boxB.y + boxB.h &&
    boxA.y + boxA.h > boxB.y;
}

function boxToCircleCollision(box, circle) {
  const deltaX = circle.x - Math.max(box.x, Math.min(circle.x, box.x + box.w));
  const deltaY = circle.y - Math.max(box.y, Math.min(circle.y, box.y + box.h));

  return (deltaX * deltaX + deltaY * deltaY) < (circle.r * circle.r);
}

/**
 * Check if a specific key fired an event
 * @param {Event} event
 * @param {String|Array} code - String or array of strings code for the
 * key to be checked.
 */
function isKeyPressed(event, code) {
  if (!event.code) return;

  return Array.isArray(code) ? code.includes(event.code) : event.code === code;
}

/**
 * Check if event is a touch/mouse event
 * @param {Event} event
 * @param {boolean} start - check on start/down or end/up event.
 * @param {boolean} [which] - mouse buton to check on.
 * @returns {boolean}
 */
function isTap(event, start = true, which) {
  if (which && event.which && event.which !== which) return;

  return start ?
    event.type === 'touchstart' || event.type === 'mousedown' || event.type === 'pointerdown' :
    event.type === 'touchend' || event.type === 'mouseup' || event.type === 'pointerup';
}