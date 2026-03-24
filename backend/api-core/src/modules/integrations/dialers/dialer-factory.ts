import type { DialerProvider } from "./dialer-provider.interface.js";
import { VonixDialerAdapter } from "./vonix.adapter.js";

/** Resolve adapter por provedor (extensível para Aspect, 3C, etc.). */
export function getDialerAdapter(provider: string): DialerProvider {
  switch (provider) {
    case "vonix":
      return new VonixDialerAdapter();
    case "aspect":
    case "3c":
    case "custom":
    default:
      return new VonixDialerAdapter();
  }
}
