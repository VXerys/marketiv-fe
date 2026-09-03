// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NegotiationStage } from "@/types/domain";

import { MessageComposer } from "../MessageComposer";

let root: Root | undefined;
let host: HTMLDivElement;

async function renderComposer(stage: NegotiationStage) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root?.render(
      <MessageComposer
        stage={stage}
        onSendMessage={vi.fn()}
        onSendOffer={vi.fn()}
        onPay={vi.fn()}
      />
    );
  });
  await act(async () => {
    (document.querySelector('button[aria-label="Aksi cepat"]') as HTMLButtonElement).click();
  });
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

describe("MessageComposer custom-offer action", () => {
  it.each(["completed", "cancelled"] as const)(
    "shows Kirim Penawaran Khusus after %s deal",
    async (stage) => {
      await renderComposer(stage);
      expect(document.body.textContent).toContain("Kirim Penawaran Khusus");
    }
  );

  it.each(["pending_payment", "in_progress", "revision"] as const)(
    "hides Kirim Penawaran Khusus during %s",
    async (stage) => {
      await renderComposer(stage);
      expect(document.body.textContent).not.toContain("Kirim Penawaran Khusus");
    }
  );
});
