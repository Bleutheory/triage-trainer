// jest.setup.js
// jest.setup.js
global.BroadcastChannel = class {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }
  postMessage(message) {
    // Simulate async message delivery
    if (typeof this.onmessage === 'function') {
      setTimeout(() => this.onmessage({ data: message }), 0);
    }
  }
  close() {}
};