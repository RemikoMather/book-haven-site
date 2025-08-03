// Storage Manager for handling localStorage and sessionStorage
export class StorageManager {
    constructor(storageType = 'local') {
        this.storage = storageType === 'local' ? localStorage : sessionStorage;
    }

    // Set item with optional expiry
    set(key, value, expiryHours = null) {
        const item = {
            value: value,
            timestamp: new Date().getTime(),
            expiry: expiryHours ? new Date().getTime() + (expiryHours * 60 * 60 * 1000) : null
        };
        this.storage.setItem(key, JSON.stringify(item));
    }

    // Get item and check expiry
    get(key) {
        const item = this.storage.getItem(key);
        if (!item) return null;

        const parsedItem = JSON.parse(item);
        if (parsedItem.expiry && new Date().getTime() > parsedItem.expiry) {
            this.remove(key);
            return null;
        }
        return parsedItem.value;
    }

    remove(key) {
        this.storage.removeItem(key);
    }

    clear() {
        this.storage.clear();
    }

    // Get all items with a specific prefix
    getAllWithPrefix(prefix) {
        const items = {};
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key.startsWith(prefix)) {
                items[key] = this.get(key);
            }
        }
        return items;
    }
}

// Initialize storage managers
const localStore = new StorageManager('local');
const sessionStore = new StorageManager('session');
