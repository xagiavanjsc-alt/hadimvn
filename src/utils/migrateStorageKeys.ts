// ─── Migration Script for localStorage Keys ─────────────────────────────────────
// This script migrates data from old kts_* keys to new keys for consistency
// Run this once in the app initialization or when deploying

const MIGRATION_KEY = "storage_keys_migrated_v1";

interface MigrationMap {
  oldKey: string;
  newKey: string;
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
  // Check if migration already ran
  if (localStorage.getItem(MIGRATION_KEY) === "true") {
    return;
  }

  console.log("[Migration] Starting localStorage key migration...");

  MIGRATIONS.forEach(({ oldKey, newKey }) => {
    try {
      const oldData = localStorage.getItem(oldKey);
      
      if (oldData) {
        // Check if new key already has data
        const existingNewData = localStorage.getItem(newKey);
        
        if (!existingNewData) {
          // Move data from old key to new key
          localStorage.setItem(newKey, oldData);
          console.log(`[Migration] Migrated ${oldKey} → ${newKey}`);
          
          // Remove old key
          localStorage.removeItem(oldKey);
        } else {
          console.log(`[Migration] Skipped ${oldKey} → ${newKey} (new key already has data)`);
        }
      }
    } catch (error) {
      console.error(`[Migration] Failed to migrate ${oldKey}:`, error);
    }
  });

  // Mark migration as complete
  localStorage.setItem(MIGRATION_KEY, "true");
  console.log("[Migration] Migration complete");
}

// Export for manual trigger if needed
export { MIGRATIONS };
