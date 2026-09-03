import type { BookmakerId } from "@booking-code-converter/shared";
import type { BookmakerAdapter } from "@booking-code-converter/shared";

export class AdapterRegistry {
  private adapters = new Map<BookmakerId, BookmakerAdapter>();

  register(bookmaker: BookmakerId, adapter: BookmakerAdapter): void {
    this.adapters.set(bookmaker, adapter);
  }

  get(bookmaker: BookmakerId): BookmakerAdapter | undefined {
    return this.adapters.get(bookmaker);
  }

  has(bookmaker: BookmakerId): boolean {
    return this.adapters.has(bookmaker);
  }

  list(): BookmakerId[] {
    return [...this.adapters.keys()];
  }
}
