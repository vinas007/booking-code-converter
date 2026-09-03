import type { BookmakerId } from "./bookmaker.js";
import type { ConversionRequest, ConversionResult } from "./betting-model.js";

export interface ConversionService {
  convert(request: ConversionRequest): Promise<ConversionResult>;
}

export interface AdapterRegistry {
  get(bookmaker: BookmakerId): unknown;
  register(bookmaker: BookmakerId, adapter: unknown): void;
}
