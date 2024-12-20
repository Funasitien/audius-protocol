begin;
do $$ begin -- run only on stage
if exists (
    select *
    from "blocks"
    where "blockhash" = '0x65a3243860511ed28a933c3a113dea7df368ad53f721cc9d0034c0c75f996afb'
) then -- check whether the data has already been backfilled and return early for idempotency
if exists (
    select 1
    from user_challenges
    where challenge_id = 'o' -- not future proof but safe for now
) then return;
end if;
-- ========== one shot trigger ==========
WITH max_block AS (
    SELECT MAX(number) AS completed_blocknumber
    FROM blocks
),
one_shot_users as (
    select temp.handle_lc,
        temp.amount,
        users.user_id
    from temp_stage_one_shot temp
        join users on temp.handle_lc = users.handle_lc
)
INSERT INTO user_challenges (
        user_id,
        challenge_id,
        specifier,
        is_complete,
        current_step_count,
        completed_blocknumber,
        amount,
        created_at,
        completed_at
    )
SELECT osu.user_id,
    'o' as challenge_id,
    concat(to_hex(user_id), ':', to_hex(1)) AS specifier,
    -- user_id:nth_shot for future proofing
    TRUE AS is_complete,
    0 AS current_step_count,
    mb.completed_blocknumber,
    CAST(osu.amount AS INT) AS amount,
    NOW() AS created_at,
    NOW() AS created_at
FROM one_shot_users osu,
    max_block mb;
end if;
end $$;
commit;