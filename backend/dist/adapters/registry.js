export class AdapterRegistry {
    adapters = new Map();
    register(bookmaker, adapter) {
        this.adapters.set(bookmaker, adapter);
    }
    get(bookmaker) {
        return this.adapters.get(bookmaker);
    }
    has(bookmaker) {
        return this.adapters.has(bookmaker);
    }
    list() {
        return [...this.adapters.keys()];
    }
}
//# sourceMappingURL=registry.js.map