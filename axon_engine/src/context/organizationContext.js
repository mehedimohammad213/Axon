const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

const OrganizationContext = {
  run(orgId, bypass, fn) {
    return storage.run({ orgId, bypass }, fn);
  },

  set(orgId) {
    const store = storage.getStore();
    if (store) {
      store.orgId = orgId;
      store.bypass = false;
    }
  },

  bypass() {
    const store = storage.getStore();
    if (store) {
      store.bypass = true;
    }
  },

  get() {
    const store = storage.getStore();
    return store?.orgId ?? null;
  },

  isBypassed() {
    const store = storage.getStore();
    return store?.bypass ?? false;
  },

  clear() {
    const store = storage.getStore();
    if (store) {
      store.orgId = null;
      store.bypass = false;
    }
  },
};

module.exports = OrganizationContext;
