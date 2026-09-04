begin;

-- Widens oracle_ai_usage_log's feature check constraint (migration 017) to
-- allow 'content-clips' -- the new auto-generated content-creator clips
-- feature also calls Gemini and must be cost-tracked the same as every
-- other feature (see lib/oracle/gemini/gemini-usage-log.ts). No other
-- change: same table, same "internal-only, no select policy" design.

alter table public.oracle_ai_usage_log
    drop constraint oracle_ai_usage_log_feature_check;

alter table public.oracle_ai_usage_log
    add constraint oracle_ai_usage_log_feature_check
    check (feature in (
        'full-match-analysis', 'loadout-intelligence', 'oracle-chat',
        'content-clips'
    ));

commit;
