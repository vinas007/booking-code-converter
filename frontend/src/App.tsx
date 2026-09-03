import { useState, type FormEvent } from "react";
import { BOOKMAKERS, BOOKMAKER_LABELS, type BookmakerId } from "@booking-code-converter/shared";

export default function App() {
  const [sourceBookmaker, setSourceBookmaker] = useState<BookmakerId>(BOOKMAKERS[0]);
  const [targetBookmaker, setTargetBookmaker] = useState<BookmakerId>(BOOKMAKERS[0]);
  const [bookingCode, setBookingCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Conversion functionality is currently under development. Check back soon!");
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Booking Code Converter</h1>
        <p>Convert sports booking codes between bookmakers</p>
      </header>

      <form className="converter-card" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="source-bookmaker">Source Bookmaker</label>
          <select
            id="source-bookmaker"
            value={sourceBookmaker}
            onChange={(e) => setSourceBookmaker(e.target.value as BookmakerId)}
          >
            {BOOKMAKERS.map((id) => (
              <option key={id} value={id}>
                {BOOKMAKER_LABELS[id]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="booking-code">Booking Code</label>
          <input
            id="booking-code"
            type="text"
            value={bookingCode}
            placeholder="Enter your booking code"
            onChange={(e) => setBookingCode(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="target-bookmaker">Target Bookmaker</label>
          <select
            id="target-bookmaker"
            value={targetBookmaker}
            onChange={(e) => setTargetBookmaker(e.target.value as BookmakerId)}
          >
            {BOOKMAKERS.map((id) => (
              <option key={id} value={id}>
                {BOOKMAKER_LABELS[id]}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="convert-btn">
          Convert
        </button>

        {message && <div className="info-banner">{message}</div>}
      </form>
    </div>
  );
}
