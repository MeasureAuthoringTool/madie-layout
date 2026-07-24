import type {
  MeasureServiceApi,
  CqlLibraryServiceApi,
} from "@madie/madie-util";

/**
 * Performs the pre-logout cleanup that must happen before `oktaAuth.signOut()`:
 * releases any measures and CQL libraries the user currently has locked so that
 * other team members are not blocked from editing them after a timeout or a
 * manual sign out.
 *
 * Failures (network error, server error, etc.) are logged but intentionally
 * swallowed — logout must always be able to proceed so the user never gets
 * stuck in a limbo state.
 *
 * @param measureServiceApi    Measure service instance (from `useMeasureServiceApi`)
 * @param cqlLibraryServiceApi CQL library service instance (from `useCqlLibraryServiceApi`)
 */
export async function performLogoutCleanup(
  measureServiceApi: MeasureServiceApi,
  cqlLibraryServiceApi: CqlLibraryServiceApi
): Promise<void> {
  try {
    await measureServiceApi.unlockMeasures();
    await cqlLibraryServiceApi.unlockLibraries();
  } catch (error) {
    console.error("Error unlocking measures for user", error);
  }
}

export default performLogoutCleanup;
