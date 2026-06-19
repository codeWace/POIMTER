import { SignalPoint } from "./types";

export class SignalStore {
  private signals: SignalPoint[] = [];

  add(signal: SignalPoint) {
    this.signals.push(signal);
  }

  getAll() {
    return this.signals;
  }

  clear() {
    this.signals = [];
  }
}