import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { executeFunction, FUNCTION_IDS } from "@/lib/appwrite/functions";
import { mockDelay } from "@/lib/mock-delay";
import {
  failFromError,
  failFromWriteError,
  noData,
  ok,
} from "@/services/shared/service-result";
import type { ServiceResult } from "@/types/domain";

export interface TosStatus {
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: string | null;
  needsConsent: boolean;
}

export interface TosAcceptResult {
  success: boolean;
  alreadyAccepted: boolean;
  tos_version: string;
}

const MOCK_CURRENT_TOS_VERSION = "v3.1";
const MOCK_TOS_ACCEPTED_AT = "2026-09-01T00:00:00.000Z";

const getMockTosStatus = (): TosStatus => ({
  currentVersion: MOCK_CURRENT_TOS_VERSION,
  acceptedVersion: MOCK_CURRENT_TOS_VERSION,
  acceptedAt: MOCK_TOS_ACCEPTED_AT,
  needsConsent: false,
});

export async function getTosStatus(): Promise<ServiceResult<TosStatus>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(150);
    return ok(getMockTosStatus());
  }

  try {
    return ok(await executeFunction<TosStatus>(FUNCTION_IDS.acceptTos, { action: "status" }));
  } catch (error) {
    return failFromError(error, noData<TosStatus>(), "tos.status");
  }
}

export async function acceptCurrentTos(
  version: string
): Promise<ServiceResult<TosAcceptResult>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(150);
    return ok({ success: true, alreadyAccepted: true, tos_version: MOCK_CURRENT_TOS_VERSION });
  }

  try {
    return ok(await executeFunction<TosAcceptResult>(FUNCTION_IDS.acceptTos, {
      action: "accept",
      tos_version: version,
    }));
  } catch (error) {
    return failFromWriteError(error, noData<TosAcceptResult>(), undefined, "tos.accept");
  }
}
