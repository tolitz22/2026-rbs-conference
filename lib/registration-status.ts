import { getRegistrationCount, getRegistrationSettings } from "@/lib/db";
import { getRegistrationGateStatus } from "@/lib/registration-gate";

export async function loadRegistrationStatus() {
  const settings = await getRegistrationSettings();
  const currentCount = await getRegistrationCount();
  const status = getRegistrationGateStatus(settings, currentCount);

  return {
    ...status,
    currentCount
  };
}
