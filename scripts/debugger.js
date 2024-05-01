class Log {
  constructor(id, value) {
    this.id = id;
    this.value = value;
  }

  update(newValue) {
    this.value = newValue;
  }
}

class Debugger {
  constructor() {
    this.logs = [];
    this.debugdebug = 0;
  }

  getLogById(id) {
    return this.logs.find(log => log.id === id);
  }

  log(id, value) {
    const log = this.getLogById(id);

    if (log) {
      log.update(value);
    } else {
      this.logs.push(new Log(id, value));
    }
  }

  render(ctx) {
    ctx.font = '16px sans';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'left';

    this.logs.forEach((log, i) => {
      ctx.fillText(`${log.id}: ${log.value}`, 20, 16 * 1.25 * (i + 1));
    });
  }
}
