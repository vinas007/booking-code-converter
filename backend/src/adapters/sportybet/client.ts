export interface SportyBetClientConfig {
  baseUrl?: string;
  region?: string;
  timeoutMs?: number;
}

export interface SportyBetBookingSelection {
  eventId: string;
  marketId: string;
  specifier?: string;
  outcomeId: string;
}

export interface SportyBetBooking {
  shareCode: string;
  deadline?: number;
  selections: SportyBetBookingSelection[];
  outcomes?: unknown[];
  unavailableOutcomes?: unknown[];
}

interface SportyBetResponse {
  bizCode?: number;
  message?: string;
  data?: {
    shareCode?: string;
    shareURL?: string;
    deadline?: number;
    selections?: SportyBetBookingSelection[];
    outcomes?: unknown[];
    unavailableOutcomes?: unknown[];
  };
}

export class SportyBetClient {
  private readonly baseUrl: string;
  private readonly region: string;
  private readonly timeoutMs: number;

  constructor(config: SportyBetClientConfig = {}) {
    this.baseUrl = (
      config.baseUrl || "https://www.sportybet.com"
    ).replace(/\/$/, "");

    this.region = config.region || "ng";
    this.timeoutMs = config.timeoutMs || 15000;
  }

  async getBooking(code: string): Promise<SportyBetBooking> {
    const response = await this.request(
      `/api/${this.region}/orders/share/${encodeURIComponent(code)}`,
    );

    if (!response.data) {
      throw new Error("SportyBet returned no booking data.");
    }

    const selections = response.data.selections || [];

    if (selections.length === 0) {
      throw new Error("SportyBet booking contains no selections.");
    }

    return {
      shareCode: response.data.shareCode || code,
      deadline: response.data.deadline,
      selections,
      outcomes: response.data.outcomes,
      unavailableOutcomes: response.data.unavailableOutcomes,
    };
  }

  async createBooking(
    selections: SportyBetBookingSelection[],
  ): Promise<SportyBetBooking> {
    if (selections.length === 0) {
      throw new Error("Cannot create a SportyBet booking with no selections.");
    }

    const response = await this.request(
      `/api/${this.region}/orders/share`,
      {
        method: "POST",
        body: JSON.stringify({ selections }),
      },
    );

    if (!response.data?.shareCode) {
      throw new Error("SportyBet did not return a booking code.");
    }

    return {
      shareCode: response.data.shareCode,
      deadline: response.data.deadline,
      selections,
      outcomes: response.data.outcomes,
      unavailableOutcomes: response.data.unavailableOutcomes,
    };
  }

  private async request(
    path: string,
    options: RequestInit = {},
  ): Promise<SportyBetResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Current-Country": this.region.toUpperCase(),
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `SportyBet request failed with HTTP ${response.status}.`,
        );
      }

      const data = (await response.json()) as SportyBetResponse;

      if (data.bizCode !== undefined && data.bizCode !== 10000) {
        throw new Error(
          data.message || `SportyBet returned error code ${data.bizCode}.`,
        );
      }

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
}
