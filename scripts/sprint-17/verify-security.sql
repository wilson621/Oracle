\set ON_ERROR_STOP on

begin;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-4222-8222-222222222222',
    true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
begin
    if (select count(*) from public.operator_intelligence_claims) <> 1 then
        raise exception 'Authenticated own-Operator RLS visibility failed.';
    end if;
    if exists (
        select 1 from public.operator_intelligence_claims
        where operator_id <> '11111111-1111-4111-8111-111111111111'::uuid
    ) then
        raise exception 'Cross-Operator claim visibility was permitted.';
    end if;

    begin
        insert into public.operator_intelligence_claims (
            operator_id, claim_id, current_revision_id, current_revision
        ) values (
            '11111111-1111-4111-8111-111111111111',
            'forbidden-direct-write', 'forbidden-direct-write-revision-1', 1
        );
        raise exception 'Authenticated direct write was permitted.';
    exception when insufficient_privilege then
        null;
    end;

    begin
        perform public.read_operator_intelligence_eligible_claim_page(
            '11111111-1111-4111-8111-111111111111',
            'operator-game-pattern-intelligence',
            '2026-07-22T00:00:00Z', null, 1
        );
        raise exception 'Authenticated trusted RPC execution was permitted.';
    exception when insufficient_privilege then
        null;
    end;
end;
$$;
rollback;

begin;
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
do $$
begin
    begin
        perform 1 from public.operator_intelligence_claims limit 1;
        raise exception 'Anonymous table read was permitted.';
    exception when insufficient_privilege then
        null;
    end;
end;
$$;
rollback;

begin;
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;
do $$
begin
    perform public.read_operator_intelligence_eligible_claim_page(
        '11111111-1111-4111-8111-111111111111',
        'operator-game-pattern-intelligence',
        '2026-07-22T00:00:00Z', null, 1
    );
end;
$$;
rollback;

\echo 'Migration 009 RLS, anonymous, cross-Operator, and service-role verification passed.'
