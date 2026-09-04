import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  executeFunction: vi.fn(),
}));

vi.mock("@/lib/appwrite/functions", () => ({
  executeFunction: mocks.executeFunction,
  FunctionExecutionError: class FunctionExecutionError extends Error {},
  FUNCTION_IDS: {
    umkmRatecardReviews: "get-umkm-ratecard-reviews",
  },
}));

describe("UMKM Rate Card review service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads order-centric list from trusted Function", async () => {
    mocks.executeFunction.mockResolvedValue([{ orderId: "order-1" }]);
    const { getUmkmRatecardReviews } = await import("../ratecard-review.service");

    const result = await getUmkmRatecardReviews();

    expect(result).toEqual({ success: true, data: [{ orderId: "order-1" }] });
    expect(mocks.executeFunction).toHaveBeenCalledWith("get-umkm-ratecard-reviews", {});
  });

  it("loads one detail by orderId", async () => {
    mocks.executeFunction.mockResolvedValue({ orderId: "order-2" });
    const { getUmkmRatecardReview } = await import("../ratecard-review.service");

    const result = await getUmkmRatecardReview("order-2");

    expect(result).toEqual({ success: true, data: { orderId: "order-2" } });
    expect(mocks.executeFunction).toHaveBeenCalledWith("get-umkm-ratecard-reviews", {
      orderId: "order-2",
    });
  });

  it("preserves Function error code for retry UX", async () => {
    mocks.executeFunction.mockRejectedValue(Object.assign(new Error("Review gagal dimuat"), {
      code: 500,
    }));
    const { getUmkmRatecardReviews } = await import("../ratecard-review.service");

    const result = await getUmkmRatecardReviews();

    expect(result).toMatchObject({ success: false, code: "server", data: [] });
  });
});
