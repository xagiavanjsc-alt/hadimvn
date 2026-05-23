/**
 * Central registry of every localStorage key the app reads or writes.
 *
 * Why centralize:
 *   - Typos in magic-string keys silently lose user data (different key →
 *     setItem writes a new slot, getItem returns null on the original).
 *   - Renaming a key needs to be coordinated with a migration in
 *     `utils/migrateStorageKeys.ts`. Having one canonical list makes that
 *     coordination explicit.
 *   - Some keys are read or written from 5-9 different files. A central
 *     definition makes refactors safe and "find usages" useful.
 *
 * IMPORTANT — DO NOT change a key's string value without also adding a
 * migration step. The value is what users have already persisted; changing
 * it abandons their data. To rename, write a migration that moves the
 * old key's content into the new key (and removes the old).
 *
 * Naming: SCREAMING_SNAKE_CASE constants grouped by feature domain.
 */
export const STORAGE_KEYS = {
  // ─── XP / leaderboard sync ──────────────────────────────────────────────
  XP_TOTAL: "xp_total",
  XP_SYNC_PENDING: "kts_xp_sync_pending",

  // ─── Admin ──────────────────────────────────────────────────────────────
  ADMIN_VERIFIED: "kts_admin_verified",
  ADMIN_BACKUPS: "kts_admin_backups",
  ADMIN_GRANT_XP_HISTORY: "kts_admin_grant_xp_history",
  ADMIN_BACKUP_AUTOCLEAN: "kts_backup_autocleanup",
  ADMIN_BACKUP_CLEANUP_DAYS: "kts_backup_cleanup_days",
  ADMIN_PDF_EXPORTS_COUNT: "kts_pdf_exports_count",

  // ─── Settings / onboarding ──────────────────────────────────────────────
  SETTINGS: "kts_settings",
  ONBOARDING_DONE: "kts_onboarding_done",
  LAST_STUDY_TIME: "kts_last_study_time",
  BEST_SCORE: "kts_best_score",
  COUPONS: "kts_coupons",
  TOPIK_GUIDE_SEEN: "topik_guide_seen",

  // ─── Flashcards (generic) ───────────────────────────────────────────────
  FLASHCARD_KNOWN: "flashcard_known",
  AI_FLASHCARD_MEMORIES: "kts_ai_flashcard_memories",
  SR_CARDS_LEARNED: "kts_sr_cards_learned",
  SR_VOCAB: "kts_sr_vocab",

  // ─── Hanja ──────────────────────────────────────────────────────────────
  HANJA_SR_DATA: "hanja_sr_data",
  HANJA_STREAK: "hanja_streak",
  HANJA_FAVORITES: "hanja_favorites",
  HANJA_NOTES: "hanja_notes",
  HANJA_TOPIK_HISTORY: "hanja_topik_history",
  HANJA_ADV_LEARNED: "hanja_adv_learned",
  HANJA_WEEKLY_CHALLENGE: "hanja_weekly_challenge",
  HANJA_PRONUNCIATION_HISTORY: "hanja_pronunciation_history",
  HANJA_VOCAB: "kts_hanja_vocab",

  // ─── Hangul ─────────────────────────────────────────────────────────────
  HANGUL_KNOWN: "kts_hangul_known",

  // ─── EPS ────────────────────────────────────────────────────────────────
  EPS_EXAM_RESULTS: "kts_eps_exam_results",
  EPS_EXAM_HISTORY: "kts_eps_exam_history",
  EPS_EXAM_HISTORY_LEGACY: "eps_exam_history",
  EPS_EXAM_LAST_AT: "kts_eps_exam_last_at",
  EPS_TOPIC_EXAM_LAST_AT: "kts_eps_topic_exam_last_at",
  EPS_ANSWERS: "kts_eps_answers",
  EPS_WRONG_ANSWERS: "kts_eps_wrong_answers",
  EPS_START_TOPIC: "kts_eps_start_topic",
  EPS_MELON_LEARNED: "eps_melon_learned",

  // ─── Melon ──────────────────────────────────────────────────────────────
  MELON_SONGS: "kts_melon_songs",
  MELON_LESSONS: "kts_melon_lessons",
  MELON_SEEN_SONGS: "kts_melon_seen_songs",
  MELON_CACHED_SONGS: "kts_melon_cached_songs",
  MELON_FETCH_META: "kts_melon_fetch_meta",
  MELON_LEARNED_RANKS: "melon_learned_ranks",
  MELON_PLAYLIST_RANKS: "melon_playlist_ranks",
  MELON_QUIZ_SCORES: "melon_quiz_scores",
  MELON_FLASHCARD_PROGRESS: "melon_flashcard_progress",

  // ─── Naver Kin (Q&A) ────────────────────────────────────────────────────
  NAVER_KIN_QA: "kts_naver_kin_qa",
  NAVER_QA: "kts_naver_qa",
  NAVER_LIKED: "kts_naver_liked",
  NAVER_CACHE: "kts_naver_cache",

  // ─── Seoul (textbook) ───────────────────────────────────────────────────
  SEOUL_FLASHCARD_STATUS: "kts_seoul_flashcard_status",
  SEOUL_DICT_NOTES: "seoul_dict_notes",

  // ─── TOPIK ──────────────────────────────────────────────────────────────
  TOPIK_LEARNED_WORDS: "topik_learned_words",

  // ─── Dictionary ─────────────────────────────────────────────────────────
  ADV_DICT_RECENT: "adv_dict_recent",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
