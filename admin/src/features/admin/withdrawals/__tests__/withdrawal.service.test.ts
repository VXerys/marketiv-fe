import { beforeEach, describe, expect, it, vi } from "vitest";

const createExecution = vi.fn();
vi.mock("@/lib/admin/appwrite", () => ({
  functions: { createExecution },
  FUNCTION_IDS: {
    getAdminWithdrawalQueue: "get-admin-withdrawal-queue",
    reviewWithdrawal: "review-withdrawal",
  },
}));

const {
  AdminWithdrawalConflictError,
  AdminWithdrawalReadError,
  failWithdrawal,
  getAdminWithdrawals,
  markWithdrawalSucceeded,
  startWithdrawalProcessing,
} = await import("../services/withdrawal.service");

const queueItem = {
  id: "withdrawal-1",
  userId: "creator-1",
  creator: {
    name: "Creator Satu",
    username: "@creator",
    avatarUrl: null,
  },
  amount: 250000,
  payoutMethod: "bank_transfer",
  providerName: "BCA",
  accountNumber: "1234567890",
  accountName: "CREATOR SATU",
  status: "requested",
  requestedAt: "2026-08-25T01:00:00.000Z",
  processingAt: null,
  processedAt: null,
  failureReason: null,
  transferReference: null,
  adminNote: null,
  processedBy: null,
};

function execution(statusCode: number, body: unknown, status = "completed") {
  return {
    status,
    responseStatusCode: statusCode,
    responseBody: JSON.stringify(body),
  };
}

const queueSuccess = (items: unknown[] = [queueItem]) => execution(200, {
  items,
  total: items.length,
  limit: 100,
  offset: 0,
});

const queuePage = (items: unknown[], total: number, offset: number) => execution(200, {
  items,
  total,
  limit: 100,
  offset,
});

const reviewSuccess = (status: "processing" | "succeeded" | "reversed") =>
  execution(200, {
    success: true,
    withdrawalId: "withdrawal-1",
    status,
  });

describe("Admin withdrawal service", () => {
  beforeEach(() => createExecution.mockReset());

  it("reads queue only through trusted Function", async () => {
    createExecution.mockResolvedValueOnce(queueSuccess());

    await expect(getAdminWithdrawals("all")).resolves.toEqual({
      items: [queueItem],
      total: 1,
      limit: 100,
      offset: 0,
    });
    expect(createExecution).toHaveBeenCalledTimes(1);
    expect(createExecution.mock.calls[0][0]).toBe("get-admin-withdrawal-queue");
    expect(JSON.parse(createExecution.mock.calls[0][1])).toEqual({
      status: "all",
      limit: 100,
      offset: 0,
    });
  });

  it("loads every queue page so older operational withdrawals stay reachable", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      ...queueItem,
      id: `withdrawal-${index + 1}`,
    }));
    const finalItem = { ...queueItem, id: "withdrawal-101" };
    createExecution
      .mockResolvedValueOnce(queuePage(firstPage, 101, 0))
      .mockResolvedValueOnce(queuePage([finalItem], 101, 100));

    const result = await getAdminWithdrawals("all");

    expect(result.items).toHaveLength(101);
    expect(result.items.at(-1)).toEqual(finalItem);
    expect(createExecution).toHaveBeenCalledTimes(2);
    expect(JSON.parse(createExecution.mock.calls[1][1])).toEqual({
      status: "all",
      limit: 100,
      offset: 100,
    });
  });

  it.each([401, 403, 500])("propagates queue HTTP %i without fallback", async (statusCode) => {
    createExecution.mockResolvedValueOnce(execution(statusCode, { error: "denied" }, "failed"));

    await expect(getAdminWithdrawals("requested")).rejects.toMatchObject({
      name: "AdminWithdrawalReadError",
      statusCode,
      message: "denied",
    });
  });

  it("fails closed when queue DTO is malformed", async () => {
    createExecution.mockResolvedValueOnce(queueSuccess([
      { ...queueItem, creator: { ...queueItem.creator, name: 123 } },
    ]));

    await expect(getAdminWithdrawals("all")).rejects.toBeInstanceOf(
      AdminWithdrawalReadError,
    );
  });

  it("starts processing then re-fetches authoritative queue", async () => {
    createExecution
      .mockResolvedValueOnce(reviewSuccess("processing"))
      .mockResolvedValueOnce(queueSuccess([
        { ...queueItem, status: "processing", processingAt: "2026-08-25T02:00:00.000Z" },
      ]));

    const result = await startWithdrawalProcessing("withdrawal-1");

    expect(result.refresh).toMatchObject({ status: "refreshed" });
    expect(createExecution).toHaveBeenCalledTimes(2);
    expect(JSON.parse(createExecution.mock.calls[0][1])).toEqual({
      withdrawalId: "withdrawal-1",
      action: "start_processing",
    });
  });

  it("requires transfer reference before success Function call", async () => {
    await expect(markWithdrawalSucceeded({
      withdrawalId: "withdrawal-1",
      transferReference: "  ",
      adminNote: "",
    })).rejects.toThrow("Referensi transfer wajib diisi");
    expect(createExecution).not.toHaveBeenCalled();
  });

  it("marks success through Function with normalized input and refreshes queue", async () => {
    createExecution
      .mockResolvedValueOnce(reviewSuccess("succeeded"))
      .mockResolvedValueOnce(queueSuccess([{ ...queueItem, status: "succeeded" }]));

    await markWithdrawalSucceeded({
      withdrawalId: "withdrawal-1",
      transferReference: " TRX-2026-001 ",
      adminNote: " Sudah cocok ",
    });

    expect(JSON.parse(createExecution.mock.calls[0][1])).toEqual({
      withdrawalId: "withdrawal-1",
      action: "mark_succeeded",
      transferReference: "TRX-2026-001",
      adminNote: "Sudah cocok",
    });
    expect(createExecution).toHaveBeenCalledTimes(2);
  });

  it("requires failure reason before reversal Function call", async () => {
    await expect(failWithdrawal({
      withdrawalId: "withdrawal-1",
      failureReason: " ",
      adminNote: "",
    })).rejects.toThrow("Alasan kegagalan wajib diisi");
    expect(createExecution).not.toHaveBeenCalled();
  });

  it("fails withdrawal through Function and refreshes queue", async () => {
    createExecution
      .mockResolvedValueOnce(reviewSuccess("reversed"))
      .mockResolvedValueOnce(queueSuccess([{ ...queueItem, status: "reversed" }]));

    await failWithdrawal({
      withdrawalId: "withdrawal-1",
      failureReason: " Rekening tidak valid ",
      adminNote: " Hubungi kreator ",
    });

    expect(JSON.parse(createExecution.mock.calls[0][1])).toEqual({
      withdrawalId: "withdrawal-1",
      action: "fail",
      failureReason: "Rekening tidak valid",
      adminNote: "Hubungi kreator",
    });
  });

  it("keeps successful mutation final and reports failed authoritative refresh", async () => {
    createExecution
      .mockResolvedValueOnce(reviewSuccess("processing"))
      .mockResolvedValueOnce(execution(500, { error: "read failed" }, "failed"));

    await expect(startWithdrawalProcessing("withdrawal-1")).resolves.toMatchObject({
      success: true,
      refresh: { status: "failed" },
    });
    expect(
      createExecution.mock.calls.filter(([id]) => id === "review-withdrawal"),
    ).toHaveLength(1);
  });

  it("turns HTTP 409 into actionable conflict after authoritative re-fetch", async () => {
    createExecution
      .mockResolvedValueOnce(execution(409, {
        error: "Withdrawal sudah berubah. Muat ulang antrean.",
      }, "failed"))
      .mockResolvedValueOnce(queueSuccess([{ ...queueItem, status: "processing" }]));

    const error = await startWithdrawalProcessing("withdrawal-1").catch((value) => value);

    expect(error).toBeInstanceOf(AdminWithdrawalConflictError);
    expect(error).toMatchObject({
      statusCode: 409,
      message: "Withdrawal sudah berubah. Muat ulang antrean.",
      refresh: { status: "refreshed" },
    });
    expect(createExecution).toHaveBeenCalledTimes(2);
  });
});
