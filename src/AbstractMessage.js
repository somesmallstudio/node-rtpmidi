/* eslint-disable no-restricted-syntax */
// A Protocol message interface
class AbstractMessage {
    constructor() {
      this.isMessage = true;
      this.isValid = true;
      this.buffer = Buffer.alloc(0);
    }

    mixin(data) {
      for (const k in data) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(k)) {
          this[k] = data[k];
        }
      }
      return this;
    }

    parseBuffer(buffer) {
      this.buffer = buffer;
      return this;
    }

    generateBuffer() {
      return this;
    }
}

module.exports = AbstractMessage;
