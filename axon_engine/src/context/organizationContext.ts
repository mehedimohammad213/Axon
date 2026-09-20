import { AsyncLocalStorage } from 'async_hooks';

interface OrgStore {
  orgId: number | null;
  bypass: boolean;
}

const storage = new AsyncLocalStorage<OrgStore>();

const OrganizationContext = {
  run<T>(orgId: number | null, bypass: boolean, fn: () => T): T {
    return storage.run({ orgId, bypass }, fn);
  },

  set(orgId: number): void {
    const store = storage.getStore();
    if (store) {
      store.orgId = orgId;
      store.bypass = false;
    }
  },

  bypass(): void {
    const store = storage.getStore();
    if (store) {
      store.bypass = true;
    }
  },

  get(): number | null {
    const store = storage.getStore();
    return store?.orgId ?? null;
  },

  isBypassed(): boolean {
    const store = storage.getStore();
    return store?.bypass ?? false;
  },

  clear(): void {
    const store = storage.getStore();
    if (store) {
      store.orgId = null;
      store.bypass = false;
    }
  },
};

export default OrganizationContext;
