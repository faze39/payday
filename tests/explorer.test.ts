import { describe, expect, it } from "vitest";
import { txExplorerUrl } from "@/lib/explorer";

describe("txExplorerUrl", () => {
  it("builds links for supported chains", () => {
    expect(txExplorerUrl("sol", "547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4")).toBe("https://solscan.io/tx/547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4");
    const h = "0x0aab97ebb1436917d556bf02139d193701f3a9a3f165c340e9e8759dc47db5cb";
    expect(txExplorerUrl("base", h)).toBe(`https://basescan.org/tx/${h}`);
    expect(txExplorerUrl("arb", h)).toBe(`https://arbiscan.io/tx/${h}`);
    expect(txExplorerUrl("near", "8gYdkQjBaDXwqEzZ4Z1wVrXcHzW7bqQ9")).toBe("https://nearblocks.io/txns/8gYdkQjBaDXwqEzZ4Z1wVrXcHzW7bqQ9");
  });
  it("prefers an https URL from the API", () => {
    expect(txExplorerUrl("sol", "abcabcabcabcabcabc", "https://x.example/tx/1")).toBe("https://x.example/tx/1");
  });
  it("returns null for unknown chains, empty or unsafe hashes", () => {
    expect(txExplorerUrl("tron", "abcabcabcabcabcabc")).toBeNull();
    expect(txExplorerUrl(undefined, "abcabcabcabcabcabc")).toBeNull();
    expect(txExplorerUrl("sol", "<script>alert(1)</script>")).toBeNull();
    expect(txExplorerUrl("sol", "abcabcabcabcabcabc", "javascript:alert(1)")).toBe("https://solscan.io/tx/abcabcabcabcabcabc");
  });
});
