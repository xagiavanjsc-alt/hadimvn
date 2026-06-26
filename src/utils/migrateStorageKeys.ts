// ─── Migration Script for localStorage Keys ─────────────────────────────────────
// This script migrates data from old kts_* keys to new keys for consistency
// Run this once in the app initialization or when deploying

const MIGRATION_KEY = "storage_keys_migrated_v1";

interface MigrationMap {
  oldKey: string;
  newKey: string;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const MIGRATIONS: MigrationMap[] = [
  // XP-related keys
  { oldKey: "kts_xp_total", newKey: "xp_total" },
  { oldKey: "kts_total_xp", newKey: "xp_total" }, // Merge both to xp_total
  
  // Streak-related keys
  { oldKey: "kts_daily_learned", newKey: "daily_learned" },
  
  // Flashcard-related keys
  { oldKey: "kts_flashcard_known", newKey: "flashcard_known" },
  { oldKey: "kts_sr_cards", newKey: "sr_cards" },
];

export function migrateStorageKeys(): void {
  const storage = getStorage();
  if (!storage) return;

  // Check if migration already ran
  if (storage.getItem(MIGRATION_KEY) === "true") {
    return;
  }

  console.log("[Migration] Starting localStorage key migration...");

  MIGRATIONS.forEach(({ oldKey, newKey }) => {
    try {
      const oldData = storage.getItem(oldKey);

      if (oldData) {
        const existingNewData = storage.getItem(newKey);

        if (!existingNewData) {
          storage.setItem(newKey, oldData);
          console.log(`[Migration] Migrated ${oldKey} → ${newKey}`);
          storage.removeItem(oldKey);
        } else if (newKey === "xp_total") {
          // Both kts_xp_total and kts_total_xp map to xp_total. The second
          // one to run would otherwise be silently dropped — keep the larger
          // so users with values in both old keys don't lose XP on migration.
          const a = parseInt(existingNewData, 10);
          const b = parseInt(oldData, 10);
          const merged = Math.max(Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0);
          storage.setItem(newKey, String(merged));
          storage.removeItem(oldKey);
          console.log(`[Migration] Merged ${oldKey} → ${newKey} (max=${merged})`);
        } else {
          console.log(`[Migration] Skipped ${oldKey} → ${newKey} (new key already has data)`);
        }
      }
    } catch (error) {
      console.error(`[Migration] Failed to migrate ${oldKey}:`, error);
    }
  });

  // Mark migration as complete
  try {
    storage.setItem(MIGRATION_KEY, "true");
  } catch (error) {
    console.error("[Migration] Could not persist migration flag:", error);
    return;
  }
  console.log("[Migration] Migration complete");
}

// Export for manual trigger if needed
export { MIGRATIONS };
