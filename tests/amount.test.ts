import { describe, expect, it } from "vitest";
import { fromBaseUnits, toBaseUnits } from "@/lib/amount";

describe("toBaseUnits", () => {
  it("converts USD to USDC base units (6 decimals)", () => {
    expect(toBaseUnits("5", 6)).toBe("5000000");
    expect(toBaseUnits("25.5", 6)).toBe("25500000");
    expect(toBaseUnits("0.01", 6)).toBe("10000");
  });
  it("handles 24-decimal tokens without float error", () => {
    expect(toBaseUnits("1.1", 24)).toBe("1100000000000000000000000");
  });
  it("rejects bad input", () => {
    expect(() => toBaseUnits("-1", 6)).toThrow();
    expect(() => toBaseUnits("1e3", 6)).toThrow();
    expect(() => toBaseUnits("1.1234567", 6)).toThrow(/decimal places/);
  });
});

describe("fromBaseUnits", () => {
  it("round-trips", () => {
    expect(fromBaseUnits("5053531", 6)).toBe("5.053531");
    expect(fromBaseUnits("5000000", 6)).toBe("5");
    expect(fromBaseUnits("1", 6)).toBe("0.000001");
  });
});
