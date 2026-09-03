import { executeFunction, FUNCTION_IDS } from "@/lib/appwrite/functions";
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

export async function getTosStatus(): Promise<ServiceResult<TosStatus>> {
  try {
    return ok(await executeFunction<TosStatus>(FUNCTION_IDS.acceptTos, { action: "status" }));
  } catch (error) {
    return failFromError(error, noData<TosStatus>(), "tos.status");
  }
}

export async function acceptCurrentTos(
  version: string
): Promise<ServiceResult<TosAcceptResult>> {
  try {
    return ok(await executeFunction<TosAcceptResult>(FUNCTION_IDS.acceptTos, {
      action: "accept",
      tos_version: version,
    }));
  } catch (error) {
    return failFromWriteError(error, noData<TosAcceptResult>(), undefined, "tos.accept");
  }
}
