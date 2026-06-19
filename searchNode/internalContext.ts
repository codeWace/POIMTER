import { brainStore } from "@/core/brainStore";
import { InternalSignal } from "../types/searchNode.types";

export function addInternalSignal(signal: InternalSignal) {
  const state = brainStore.getState();

  const exists = (state.internalData || []).some(
    (x: any) =>
      x.product?.toLowerCase() === signal.product?.toLowerCase()
      &&
      x.notes === signal.notes
  );

  if (exists) return;

  brainStore.setState({
    internalData: [
      ...(state.internalData || []),
      {
        ...signal,
        aiRead: true,
        savedToReport: false,
        edited: false,
      },
    ],
  });
}

export function getInternalContext(product: string): InternalSignal[] {
  return (
    brainStore
      .getState()
      .internalData
      ?.filter(
        (x: any) =>
          x.product?.toLowerCase() === product.toLowerCase()
      ) || []
  );
}