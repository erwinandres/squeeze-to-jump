class EventLogger {
  constructor(element, debug) {
    this.element = element;
    this.count = 0;
    this.debug = debug;
  }

  getLogTemplate(value) {
    const li = document.createElement('li');
    li.textContent = value;
    return li;
  }

  log(value) {
    if (!this.debug) return;

    this.element.prepend(this.getLogTemplate(value));
    this.count++;

    if (this.count > 10) {
      this.element.removeChild(this.element.lastChild);
    }
  }
}