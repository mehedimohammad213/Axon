const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

const OrganizationContext = {
  run(orgId, bypass, fn, extra = {}) {
    return storage.run({
      orgId,
      bypass,
      client: extra.client || null,
    }, fn);
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

  setClient(client) {
    const store = storage.getStore();
    if (store) store.client = client;
  },

  getClient() {
    const store = storage.getStore();
    return store?.client || null;
  },

  async applyRls() {
    const store = storage.getStore();
    if (!store?.client) return;

    if (store.bypass) {
      await store.client.query("SELECT set_config('app.bypass_rls', 'on', true)");
    } else {
      await store.client.query("SELECT set_config('app.bypass_rls', 'off', true)");
    }

    if (store.orgId) {
      await store.client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [String(store.orgId)]
      );
    } else {
      await store.client.query("SELECT set_config('app.organization_id', '', true)");
    }
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
