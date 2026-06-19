import { BandMessage } from "./bandTypes";

type Listener = (msg: BandMessage) => void;

class BandMessageBus {
  private listeners: Listener[] = [];
  private history: BandMessage[] = [];

  emit(msg: BandMessage) {
    this.history.push(msg);
    this.listeners.forEach((l) => l(msg));
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);

    // replay history
    this.history.forEach(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getHistory(roomId: string) {
    return this.history.filter((m) => m.roomId === roomId);
  }

  // ✅ ADD THIS INSIDE CLASS (important)
  getLatestByRole(roomId: string, role: string) {
    const messages = this.history.filter(
      (m) => m.roomId === roomId && m.from === role
    );

    return messages[messages.length - 1] || null;
  }
}

export const bandBus = new BandMessageBus();