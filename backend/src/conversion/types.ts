import type { ConversionRequest, ConversionResult } from "@booking-code-converter/shared";

export interface ConversionService {
  convert(request: ConversionRequest): Promise<ConversionResult>;
}
