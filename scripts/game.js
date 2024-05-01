class Game {
  #DBName = 'JumpDB';
  #DBVersion = '1.0';
  #DEFAULT_SPEED = 200;

  constructor(canvas, extras) {
    this.debug = extras.debug || false;

    // get canvas and context
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // set floor position
    this.initialFloorPosition = this.canvas.height - (this.canvas.height/4);
    this.floorPosition = this.initialFloorPosition;

    // last frame time stamp
    this.lastTime;

    // keep track of the animation Id
    this.animationId;

    // store frame rate for debugging purposes
    this.fps;

    this.speed = 0;
    this.gravity = 0.5;
    this.friction = 2500;
    this.sliding = false;

    this.score = 0;
    this.best = 0;

    this.scene = "main";

    //create our hero
    this.hero = new Hero(20, this.initialFloorPosition - 20, 12, 16);
    this.platforms = [];

    this.targetPlatform;

    this.debugger = new Debugger();
    this.eventLogger = new EventLogger(extras.eventLoggerElement, this.debug);
  }

  spawnPlatform(n) {
    for(let i = 0; i < n; i++) {
      const lastPlatform = this.platforms[this.platforms.length - 1];
      const lastPlatformEnd = lastPlatform.x + lastPlatform.w;

      this.platforms.push(new Platform(getRandomNum(lastPlatformEnd + 40, lastPlatformEnd + 120), this.initialFloorPosition, getRandomNum(0, 2)));
    }
  }

  removeFloor() {
    this.platform = this.canvas.height + this.hero.h + 20;

    if (!this.hero.jumping) {
      this.hero.jumping = true;
    }
  }

  handleEvent(event) {
    switch(event.type) {
      case 'keydown':
      case 'pointerdown':
        event.preventDefault();
        event.stopPropagation();
        event.cancelBubble = true;
        event.returnValue = false;

        this.onKeyDownOrTouchStart(event);
        return false;
        break;
      case 'keyup':
      case 'pointerup':
        event.preventDefault();
        event.stopPropagation();
        event.cancelBubble = true;
        event.returnValue = false;

        this.onKeyUpOrTouchEnd(event);
        return false;
        break;
      case 'visibilitychange':
      case 'blur':
      case 'focus':
        this.onVisibilityChange(event);
        break;
      case 'contextmenu':
        this.onContextMenu(event);
        break;
      case 'resize':
      case 'orientationchange':
        //this.adjustDimensions(e);
        break;
    }
  }

  onContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  onKeyDownOrTouchStart(event) {
    const touch =  isTap(event, true, 1);

    this.eventLogger.log(event.type);

    if (this.scene === 'main') {
    } else if (this.scene === 'paused') {
    } else if (this.scene === 'over') {
    } else {
      if (isKeyPressed(event, ['Space', 'ArrowUp']) || touch) {

        if (!this.hero.jumping) this.hero.impulsing = true;
      }
    }
  }

  onKeyUpOrTouchEnd(event) {
    const touch =  isTap(event, false, 1);

    this.eventLogger.log(event.type);

    if (this.scene === 'main') {
      if (isKeyPressed(event, 'Space') || touch) {
        this.scene = 'playing';
      }
    } else if (this.scene === 'paused') {
      if (
        isKeyPressed(event, ['Space', 'Escape']) || touch
      ) {
        this.scene = 'playing';
      }
    } else if (this.scene === 'over') {
      if (
        isKeyPressed(event, ['Space', 'Escape']) || touch
      ) {
        this.scene = 'main';
        this.reset();
      }
    } else {
      if (
        isKeyPressed(event, ['Space', 'ArrowUp']) || touch
      ) {
        if (this.hero.impulsing) this.hero.jump();
      } else if (isKeyPressed(event, 'Escape')) {
        this.scene = 'paused';
      }
    }
  }

  onVisibilityChange(event) {
    if (this.scene !== 'playing') return;
    if (document.hidden || document.webkitHidden || event.type == 'blur' ||
      document.visibilityState !== 'visible') {
      this.scene = 'paused';
    }
  }

  listen() {
    document.addEventListener('keydown', this);
    document.addEventListener('keyup', this);

    if ('ontouchstart' in window || window.PointerEvent) {
        document.addEventListener('pointerdown', this);
        document.addEventListener('pointerup', this);
        document.addEventListener('touchstart', this, {passive: false});
        document.addEventListener('touchend', this, {passive: false});
    } else {
        document.addEventListener('mousedown', this);
        document.addEventListener('mouseup', this);
    }

    document.addEventListener('visibilitychange', this);
    window.addEventListener('blur', this);
    window.addEventListener('focus', this);

    window.addEventListener('resize', this, false);
    window.addEventListener('orientationchange', this, false);

    window.addEventListener('contextmenu', this, false);
  }

  render() {
    // clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.scene === 'main') {
      const titleText = 'Squeeze to jump';
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillStyle = '#05668D';
      this.ctx.fillText(titleText, (this.canvas.width/2) - (this.ctx.measureText(titleText).width/2), this.canvas.height/2);
      

      const playCTAText = 'Tap/space to play';
      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(playCTAText, (this.canvas.width/2) - (this.ctx.measureText(playCTAText).width/2), (this.canvas.height/2) + 30 );

      if (this.best) {
        const bestScoreText = 'Best: ' + this.best;
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(bestScoreText, (this.canvas.width/2) - (this.ctx.measureText(bestScoreText).width/2), (this.canvas.height/2) + 30 + 30);
      }
    } else {
      for(let i = 0; i < this.platforms.length; i++) {
        this.platforms[i].render(this.ctx, this.debug);
      }
  
      this.hero.render(this.ctx);

      // write score
      this.ctx.font = '30px Arial';
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(this.score, (this.canvas.width/2) - (this.ctx.measureText(this.score).width/2), this.canvas.height/4);
  
      if (this.scene === 'paused') {
        const pauseCTAText = 'Paused';
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(pauseCTAText, (this.canvas.width/2) - (this.ctx.measureText(pauseCTAText).width/2), this.canvas.height/2);
      } else if (this.scene === 'over') {
        const bestScoreText = 'Best: ' + this.best;
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(bestScoreText, (this.canvas.width/2) - (this.ctx.measureText(bestScoreText).width/2), (this.canvas.height/4) + 28);

        const gameOverText = 'Game Over';
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(gameOverText, (this.canvas.width/2) - (this.ctx.measureText(gameOverText).width/2), this.canvas.height/2);
      }

      //debug
      if (this.debug) {
        this.debugger.render(this.ctx);
      }
    }
  }

  update(dt) {
    if (this.scene === 'main' || this.scene === 'paused') {

    } else {
      // count dead platforms to delete them later
      let deadPlatforms = 0;
      
      if (this.hero.jumping) {
        this.sliding = false;
        this.speed = this.#DEFAULT_SPEED;
      } else {
        const minSpeed = this.sliding ? 20 : 0;
        this.speed = Math.max(this.speed - (this.friction * dt), minSpeed);
      }
      
      this.floorPosition = this.canvas.height + this.hero.h + 20;
  
      // TODO: merge these two loops
      for(let i = 0; i < this.platforms.length; i++) {
        const platform = this.platforms[i];
        platform.update(dt, this.hero.jumping, this.speed);
  
        if (
          ((this.hero.x >= platform.x && this.hero.x <= platform.x + platform.w) ||
          (this.hero.x + this.hero.w >= platform.x && this.hero.x + this.hero.w <= platform.x + platform.w)) &&
          this.hero.y + this.hero.h < platform.y && !platform.dead
        ) {
          this.floorPosition = platform.y;
        }
  
        if (platform.x + platform.w < 0) {
          deadPlatforms++;
        }
      }
      
      for(let i = 0; i < this.platforms.length; i++) {
        if (this.targetPlatform) break;

        const platform = this.platforms[i];
        platform.isLast = false;

        if (platform.x >= this.hero.x + this.hero.w) {
          platform.isLast = true;
          this.targetPlatform = platform;
          break;
        }
        
        if (i === this.platforms.length - 1) {
          platform.isLast = true;
          this.targetPlatform = platform;
        }
      }
  
      this.hero.update(dt, this.gravity, this.floorPosition);
  
      //remove and respawn
      if (!this.hero.jumping && this.hero.x + this.hero.w >= this.targetPlatform.x) {
        if (this.hero.y <= this.targetPlatform.y) {
          this.targetPlatform.activated = true;

          if (this.targetPlatform.type === 2) {
            this.sliding = true;
          }

          this.targetPlatform = null;

          this.score ++;
          this.spawnPlatform(3);
        }
  
        // remove dead platforms when there are more than 10
        if (this.platforms.length > 10) {
          this.platforms.splice(0, deadPlatforms);
        }
      }

      if (this.hero.y > this.canvas.height) {
        this.scene = 'over';

        if (this.score > this.best) {
          this.best = this.score;
          localStorage.setItem(this.#DBName + '_v' + this.#DBVersion, JSON.stringify({ best: this.best }));
        }
      }
    }

    this.debugger.log('FPS', this.fps);
    this.debugger.log('X', this.hero.x);
    this.debugger.log('Y', this.hero.y);
    this.debugger.log('Impulse', this.hero.impulse);
  }

  reset() {
    this.floorPosition = this.initialFloorPosition;
    this.sliding = false;
    this.hero.x = 20;
    this.hero.y = this.initialFloorPosition - 20;
    this.hero.jumping = false;
    this.hero.impulsing = false;
    this.hero.impulse = 0.0;
    this.hero.velocityY = 0.0;
    this.hero.landingHit = 0;

    this.targetPlatform = null;
    this.platforms.length = 0;
    this.score = 0;

    this.platforms.push(new Platform(0, this.floorPosition));
    this.platforms.push(new Platform(100, this.floorPosition));
  }

  loop(timeStamp) {
    const dt = (timeStamp - this.lastTime) / 1000;
    this.lastTime = timeStamp;

    this.fps = Math.round(1 / dt);

    this.render();
    this.update(dt);

    // queue next frame
    this.animationId = requestAnimFrame(this.loop.bind(this));
  }

  fetchDB() {
    const dbData = JSON.parse(localStorage.getItem(this.#DBName + '_v' + this.#DBVersion)) || {};

    this.best = dbData.best || 0;
  }

  init() {
    this.lastTime = window.performance.now();

    this.fetchDB();

    this.platforms.push(new Platform(0, this.floorPosition));
    this.platforms.push(new Platform(100, this.floorPosition));

    this.listen();
    this.loop();
  }
}

const game = new Game(document.getElementById('canvas'), {
  debug: false,
  eventLoggerElement: document.getElementById('events-list')
});
game.init();