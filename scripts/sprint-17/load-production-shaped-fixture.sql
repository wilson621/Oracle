\set ON_ERROR_STOP on
\timing on

begin;
set local synchronous_commit = off;
set local timezone = 'UTC';

insert into public.operators (id, callsign)
values
    ('33333333-3333-4333-8333-333333333333', 'Sprint 17 Hot Operator'),
    ('44444444-4444-4444-8444-444444444444', 'Sprint 17 Isolation Operator');

insert into public.oracle_sessions (id, operator_id)
values
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '33333333-3333-4333-8333-333333333333'),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        '44444444-4444-4444-8444-444444444444');

insert into public.operator_data_policy_versions (
    policy_id, policy_version, purpose, retention_class, effective_from,
    effective_until, allowed_claim_types, minimum_evidence_quality,
    allowed_source_classifications, evidence_reference_days,
    superseded_claim_revision_days, maximum_claim_validity_days,
    reassess_after_days, policy_contract
)
select
    'operator-secondary-verification', policy_version,
    'operator-secondary-verification', retention_class, effective_from,
    effective_until, allowed_claim_types, minimum_evidence_quality,
    allowed_source_classifications, evidence_reference_days,
    superseded_claim_revision_days, maximum_claim_validity_days,
    reassess_after_days,
    jsonb_set(
        jsonb_set(
            policy_contract,
            '{id}',
            '"operator-secondary-verification"'::jsonb
        ),
        '{purpose}',
        '"operator-secondary-verification"'::jsonb
    )
from public.operator_data_policy_versions
where policy_id = 'operator-game-pattern-intelligence'
  and policy_version = '1.0.0';

insert into public.operator_consent_decisions (
    operator_id, consent_decision_id, purpose, policy_id, policy_version,
    decision, effective_at, recorded_at, supersedes_decision_id,
    consent_contract
)
select
    operator_id,
    'hot-consent',
    'operator-game-pattern-intelligence',
    'operator-game-pattern-intelligence',
    '1.0.0',
    'granted',
    '2025-01-01T00:00:00Z'::timestamptz,
    '2025-01-01T00:00:00Z'::timestamptz,
    null,
    jsonb_build_object(
        'contract', jsonb_build_object(
            'name', 'oracle.operator-consent-decision', 'version', 1
        ),
        'id', 'hot-consent',
        'operatorId', operator_id,
        'purpose', 'operator-game-pattern-intelligence',
        'policyId', 'operator-game-pattern-intelligence',
        'policyVersion', '1.0.0',
        'decision', 'granted',
        'effectiveAt', '2025-01-01T00:00:00.000Z',
        'recordedAt', '2025-01-01T00:00:00.000Z',
        'supersedesDecisionId', null,
        'provenance', jsonb_build_object(
            'sourceOwnerType', 'operator-service',
            'sourceOwnerId', 'operator-service',
            'method', 'operator-declaration',
            'producerId', 'sprint-17-fixture',
            'producerVersion', '1.0.0',
            'generatedAt', '2025-01-01T00:00:00.000Z'
        )
    )
from (values
    ('33333333-3333-4333-8333-333333333333'::uuid),
    ('44444444-4444-4444-8444-444444444444'::uuid)
) operators(operator_id);

insert into public.operator_intelligence_evidence (
    operator_id, evidence_reference_id, source_type, source_owner_id,
    source_record_id, observed_at, captured_at, purpose, producer_id,
    producer_version, producer_method, session_id, integration_id,
    integration_version, evidence_quality_score, content_digest,
    retention_class, policy_id, policy_version, evidence_contract
)
select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'hot-evidence-' || n,
    'game-integration-observation',
    'call-of-duty',
    'hot-source-' || n,
    '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => n),
    '2026-01-01T00:00:01Z'::timestamptz + make_interval(secs => n),
    'operator-game-pattern-intelligence',
    'call-of-duty',
    '1.0.0',
    'direct-observation',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
    'call-of-duty',
    '1.0.0',
    0.8,
    'sha256:' || md5(n::text) || md5(('hot-' || n)::text),
    'game-session-derived-intelligence',
    'operator-game-pattern-intelligence',
    '1.0.0',
    jsonb_build_object(
        'contract', jsonb_build_object(
            'name', 'oracle.operator-evidence-reference', 'version', 1
        ),
        'id', 'hot-evidence-' || n,
        'operatorId', '33333333-3333-4333-8333-333333333333',
        'sourceType', 'game-integration-observation',
        'sourceOwnerId', 'call-of-duty',
        'sourceRecordId', 'hot-source-' || n,
        'observedAt', to_char(
            '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => n),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ),
        'capturedAt', to_char(
            '2026-01-01T00:00:01Z'::timestamptz + make_interval(secs => n),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ),
        'purpose', 'operator-game-pattern-intelligence',
        'scope', jsonb_build_object(
            'type', 'session',
            'sessionId', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            'integrationId', 'call-of-duty',
            'integrationVersion', '1.0.0'
        ),
        'producer', jsonb_build_object(
            'id', 'call-of-duty', 'version', '1.0.0',
            'method', 'direct-observation'
        ),
        'quality', jsonb_build_object(
            'score', 0.8,
            'rationale', 'Production-shaped deterministic fixture.',
            'policyId', 'operator-game-pattern-intelligence',
            'policyVersion', '1.0.0',
            'assessedAt', '2026-01-01T00:00:00.000Z'
        ),
        'summary', 'Production-shaped minimal Evidence reference.',
        'contentDigest', 'sha256:' || md5(n::text) || md5(('hot-' || n)::text),
        'retentionClass', 'game-session-derived-intelligence',
        'policyId', 'operator-game-pattern-intelligence',
        'policyVersion', '1.0.0'
    )
from generate_series(1, 100000) fixture(n);

insert into public.operator_intelligence_evidence_dispositions (
    operator_id, evidence_reference_id, disposition_id, disposition, reason,
    effective_at, recorded_at, supersedes_disposition_id,
    disposition_contract
)
select
    operator_id,
    evidence_reference_id,
    'hot-disposition-' || ordinal,
    'available',
    'Production-shaped fixture is available.',
    captured_at,
    captured_at,
    null,
    jsonb_build_object(
        'contract', jsonb_build_object(
            'name', 'oracle.operator-evidence-disposition', 'version', 1
        ),
        'id', 'hot-disposition-' || ordinal,
        'operatorId', operator_id,
        'evidenceReferenceId', evidence_reference_id,
        'disposition', 'available',
        'reason', 'Production-shaped fixture is available.',
        'effectiveAt', to_char(captured_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'recordedAt', to_char(captured_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'supersedesDispositionId', null
    )
from (
    select *, row_number() over (order by evidence_reference_id) as ordinal
    from public.operator_intelligence_evidence
    where operator_id = '33333333-3333-4333-8333-333333333333'
) evidence;

insert into public.operator_intelligence_evidence_admissions (
    operator_id, admission_id, evidence_reference_id,
    evidence_disposition_id, session_id, source_record_id, integration_id,
    integration_version, purpose, intended_claim_type, source_classification,
    policy_id, policy_version, consent_decision_id, admitted_at,
    admission_contract
)
select
    evidence.operator_id,
    'hot-admission-' || ordinal,
    evidence.evidence_reference_id,
    disposition.disposition_id,
    evidence.session_id,
    evidence.source_record_id,
    'call-of-duty',
    '1.0.0',
    'operator-game-pattern-intelligence',
    case when ordinal % 2 = 0 then 'recurring-game-strength'
         else 'recurring-game-weakness' end,
    'game-integration-direct-observation',
    'operator-game-pattern-intelligence',
    '1.0.0',
    'hot-consent',
    evidence.captured_at + interval '1 second',
    jsonb_build_object(
        'contract', jsonb_build_object(
            'name', 'oracle.operator-game-session-evidence-admission',
            'version', 1
        ),
        'id', 'hot-admission-' || ordinal,
        'operatorId', evidence.operator_id,
        'evidenceReferenceId', evidence.evidence_reference_id,
        'evidenceDispositionId', disposition.disposition_id,
        'sessionId', evidence.session_id,
        'sourceRecordId', evidence.source_record_id,
        'integrationId', 'call-of-duty',
        'integrationVersion', '1.0.0',
        'purpose', 'operator-game-pattern-intelligence',
        'intendedClaimType', case when ordinal % 2 = 0
            then 'recurring-game-strength' else 'recurring-game-weakness' end,
        'sourceClassification', 'game-integration-direct-observation',
        'policyId', 'operator-game-pattern-intelligence',
        'policyVersion', '1.0.0',
        'consentDecisionId', 'hot-consent',
        'admittedAt', to_char(
            evidence.captured_at + interval '1 second',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        )
    )
from (
    select *, row_number() over (order by evidence_reference_id) as ordinal
    from public.operator_intelligence_evidence
    where operator_id = '33333333-3333-4333-8333-333333333333'
) evidence
join public.operator_intelligence_evidence_dispositions disposition
  on disposition.operator_id = evidence.operator_id
 and disposition.evidence_reference_id = evidence.evidence_reference_id;

set constraints all deferred;

create temporary table sprint17_claim_shape (
    claim_number integer primary key,
    maximum_revision integer not null
) on commit drop;

insert into sprint17_claim_shape (claim_number, maximum_revision)
select claim_number,
    case
        when claim_number = 1 then 1000
        when claim_number <= 1000 then 19
        when claim_number <= 9019 then 9
        else 8
    end
from generate_series(1, 10000) claim_number;

insert into public.operator_intelligence_claims (
    operator_id, claim_id, current_revision_id, current_revision
)
select
    '33333333-3333-4333-8333-333333333333',
    'hot-claim-' || claim_number,
    'hot-claim-' || claim_number || '-revision-' || maximum_revision,
    maximum_revision
from sprint17_claim_shape;

insert into public.operator_intelligence_claim_revisions (
    operator_id, claim_id, claim_revision_id, revision, claim_type, status,
    epistemic, claim_revision_contract, effective_from, valid_until,
    last_assessed_at, reassess_after, reassessment_trigger, policy_id,
    policy_version, supersedes_revision_id, deleted_at, recorded_at
)
select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'hot-claim-' || claim_number,
    'hot-claim-' || claim_number || '-revision-' || revision_number,
    revision_number,
    case when claim_number % 2 = 0 then 'recurring-game-strength'
         else 'recurring-game-weakness' end,
    case when revision_number = 1 then 'candidate'
         when revision_number = maximum_revision and claim_number % 20 = 0
            then 'expired'
         when revision_number = maximum_revision and claim_number % 20 = 1
            then 'disputed'
         when revision_number = maximum_revision then 'active'
         else 'superseded' end,
    case when revision_number = 1 then 'suspected' else 'inferred' end,
    jsonb_build_object(
        'contract', jsonb_build_object(
            'name', 'oracle.operator-intelligence-claim', 'version', 1
        ),
        'id', 'hot-claim-' || claim_number || '-revision-' || revision_number,
        'claimId', 'hot-claim-' || claim_number,
        'operatorId', '33333333-3333-4333-8333-333333333333',
        'revision', revision_number,
        'type', case when claim_number % 2 = 0
            then 'recurring-game-strength' else 'recurring-game-weakness' end,
        'status', case when revision_number = 1 then 'candidate'
            when revision_number = maximum_revision and claim_number % 20 = 0
                then 'expired'
            when revision_number = maximum_revision and claim_number % 20 = 1
                then 'disputed'
            when revision_number = maximum_revision then 'active'
            else 'superseded' end,
        'epistemic', case when revision_number = 1
            then 'suspected' else 'inferred' end,
        'value', jsonb_build_object('fixtureClaim', claim_number),
        'confidence', jsonb_build_object(
            'score', 0.8,
            'rationale', 'Production-shaped deterministic fixture.',
            'supportingEvidenceCount', 3,
            'contradictingEvidenceCount', 0,
            'policyId', 'operator-game-pattern-intelligence',
            'policyVersion', '1.0.0',
            'assessedAt', '2026-06-01T00:00:00.000Z',
            'producerNative', null
        ),
        'explanation', case when revision_number = 1 then 'null'::jsonb else
            jsonb_build_object(
                'contract', jsonb_build_object(
                    'name', 'oracle.operator-understanding-explanation',
                    'version', 1
                ),
                'summary', 'Production-shaped deterministic explanation.',
                'reasonCodes', jsonb_build_array('fixture'),
                'evidenceReferenceIds', jsonb_build_array(
                    'hot-evidence-' || (((claim_number - 1) * 30 +
                        (revision_number - 1) * 3) % 100000 + 1),
                    'hot-evidence-' || (((claim_number - 1) * 30 +
                        (revision_number - 1) * 3 + 1) % 100000 + 1),
                    'hot-evidence-' || (((claim_number - 1) * 30 +
                        (revision_number - 1) * 3 + 2) % 100000 + 1)
                ),
                'method', jsonb_build_object(
                    'kind', 'deterministic-template',
                    'id', 'sprint-17-fixture', 'version', '1.0.0'
                ),
                'policyVersion', '1.0.0',
                'generatedAt', '2026-06-01T00:00:00.000Z'
            ) end,
        'provenance', jsonb_build_object(
            'sourceOwnerType', 'oracle-engine',
            'sourceOwnerId', 'sprint-17-fixture',
            'method', 'deterministic-engine',
            'producerId', 'sprint-17-fixture',
            'producerVersion', '1.0.0',
            'generatedAt', '2026-06-01T00:00:00.000Z'
        ),
        'scope', case when claim_number % 10 = 0 then jsonb_build_object(
            'type', 'game-integration',
            'integrationId', 'call-of-duty',
            'integrationVersion', '1.0.0'
        ) else jsonb_build_object(
            'type', 'session',
            'sessionId', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            'integrationId', 'call-of-duty',
            'integrationVersion', '1.0.0'
        ) end,
        'temporalValidity', jsonb_build_object(
            'effectiveFrom', '2026-06-01T00:00:00.000Z',
            'validUntil', '2026-09-01T00:00:00.000Z',
            'lastAssessedAt', '2026-06-01T00:00:00.000Z',
            'reassessAfter', '2026-08-01T00:00:00.000Z',
            'reassessmentTrigger', null
        ),
        'policyId', 'operator-game-pattern-intelligence',
        'policyVersion', '1.0.0',
        'supersedesRevisionId', case when revision_number = 1 then null
            else 'hot-claim-' || claim_number || '-revision-' ||
                (revision_number - 1) end
    ),
    '2026-06-01T00:00:00Z'::timestamptz,
    '2026-09-01T00:00:00Z'::timestamptz,
    '2026-06-01T00:00:00Z'::timestamptz,
    '2026-08-01T00:00:00Z'::timestamptz,
    null,
    'operator-game-pattern-intelligence',
    '1.0.0',
    case when revision_number = 1 then null
        else 'hot-claim-' || claim_number || '-revision-' ||
            (revision_number - 1) end,
    null,
    '2026-06-01T00:00:00Z'::timestamptz +
        make_interval(secs => claim_number * 10 + revision_number)
from sprint17_claim_shape
cross join lateral generate_series(1, maximum_revision) revision_number;

insert into public.operator_intelligence_claim_head_events (
    operator_id, claim_id, claim_revision_id, revision, status,
    effective_from, valid_until, scope, recorded_at
)
select
    operator_id,
    claim_id,
    claim_revision_id,
    revision,
    status,
    effective_from,
    valid_until,
    claim_revision_contract -> 'scope',
    recorded_at
from public.operator_intelligence_claim_revisions
where operator_id = '33333333-3333-4333-8333-333333333333';

insert into public.operator_intelligence_claim_evidence (
    operator_id, claim_id, claim_revision_id, evidence_reference_id,
    relationship, rationale, linked_at
)
select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'hot-claim-' || claim_number,
    'hot-claim-' || claim_number || '-revision-' || revision_number,
    'hot-evidence-' || (((claim_number - 1) * 30 +
        (revision_number - 1) * 3 + link_number) % 100000 + 1),
    'support',
    'Production-shaped deterministic Evidence link.',
    '2026-06-01T00:00:00Z'::timestamptz
from sprint17_claim_shape
cross join lateral generate_series(1, maximum_revision) revision_number
cross join generate_series(0, 2) link_number;

insert into public.operator_intelligence_eligibility_assessments (
    assessment_id, operator_id, claim_id, claim_revision_id, eligible,
    reasons, purpose, policy_id, policy_version, assessed_at,
    eligibility_contract, recorded_at
)
select
    md5(claim_number || ':' || revision_number || ':' || assessment_number)::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    'hot-claim-' || claim_number,
    'hot-claim-' || claim_number || '-revision-' || revision_number,
    revision_number = maximum_revision and claim_number % 20 not in (0, 1),
    case
         when revision_number = 1 then array['candidate']::text[]
         when revision_number = maximum_revision and claim_number % 20 = 0
            then array['expired']::text[]
         when revision_number = maximum_revision and claim_number % 20 = 1
            then array['disputed']::text[]
         when revision_number = maximum_revision then '{}'::text[]
         else array['superseded']::text[] end,
    case when claim_number % 25 = 0 and revision_number < maximum_revision
        then 'operator-secondary-verification'
        else 'operator-game-pattern-intelligence' end,
    case when claim_number % 25 = 0 and revision_number < maximum_revision
        then 'operator-secondary-verification'
        else 'operator-game-pattern-intelligence' end,
    '1.0.0',
    '2026-06-01T00:00:00Z'::timestamptz +
        make_interval(secs => assessment_number),
    jsonb_build_object(
        'eligible', revision_number = maximum_revision and
            claim_number % 20 not in (0, 1),
        'reasons', case
            when revision_number = 1 then '["candidate"]'::jsonb
            when revision_number = maximum_revision and claim_number % 20 = 0
                then '["expired"]'::jsonb
            when revision_number = maximum_revision and claim_number % 20 = 1
                then '["disputed"]'::jsonb
            when revision_number = maximum_revision then '[]'::jsonb
            else '["superseded"]'::jsonb end,
        'purpose', case when claim_number % 25 = 0 and
            revision_number < maximum_revision
            then 'operator-secondary-verification'
            else 'operator-game-pattern-intelligence' end,
        'policyId', case when claim_number % 25 = 0 and
            revision_number < maximum_revision
            then 'operator-secondary-verification'
            else 'operator-game-pattern-intelligence' end,
        'policyVersion', '1.0.0',
        'assessedAt', to_char(
            '2026-06-01T00:00:00Z'::timestamptz +
                make_interval(secs => assessment_number),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        )
    ),
    '2026-06-01T00:00:00Z'::timestamptz +
        make_interval(secs => claim_number * 20 + revision_number * 2 +
            assessment_number)
from sprint17_claim_shape
cross join lateral generate_series(1, maximum_revision) revision_number
cross join generate_series(1, 2) assessment_number;

insert into public.operator_intelligence_eligibility_assessments (
    assessment_id, operator_id, claim_id, claim_revision_id, eligible,
    reasons, purpose, policy_id, policy_version, assessed_at,
    eligibility_contract, recorded_at
)
select
    md5('extra:' || claim_number || ':' || assessment_number)::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    'hot-claim-' || claim_number,
    'hot-claim-' || claim_number || '-revision-' || maximum_revision,
    claim_number % 20 not in (0, 1),
    case when claim_number % 20 = 0 then array['expired']::text[]
         when claim_number % 20 = 1 then array['disputed']::text[]
         else '{}'::text[] end,
    'operator-game-pattern-intelligence',
    'operator-game-pattern-intelligence',
    '1.0.0',
    '2026-06-01T00:00:00Z'::timestamptz +
        make_interval(secs => assessment_number + 2),
    jsonb_build_object(
        'eligible', claim_number % 20 not in (0, 1),
        'reasons', case when claim_number % 20 = 0
            then '["expired"]'::jsonb
            when claim_number % 20 = 1 then '["disputed"]'::jsonb
            else '[]'::jsonb end,
        'purpose', 'operator-game-pattern-intelligence',
        'policyId', 'operator-game-pattern-intelligence',
        'policyVersion', '1.0.0',
        'assessedAt', to_char(
            '2026-06-01T00:00:00Z'::timestamptz +
                make_interval(secs => assessment_number + 2),
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        )
    ),
    '2026-06-02T00:00:00Z'::timestamptz +
        make_interval(secs => claim_number * 5 + assessment_number)
from sprint17_claim_shape
cross join generate_series(1, 5) assessment_number;

commit;

vacuum (analyze) public.operator_intelligence_evidence;
vacuum (analyze) public.operator_intelligence_evidence_dispositions;
vacuum (analyze) public.operator_intelligence_evidence_admissions;
vacuum (analyze) public.operator_intelligence_claims;
vacuum (analyze) public.operator_intelligence_claim_revisions;
vacuum (analyze) public.operator_intelligence_claim_evidence;
vacuum (analyze) public.operator_intelligence_eligibility_assessments;

select
    (select count(*) from public.operator_intelligence_claims
        where operator_id = '33333333-3333-4333-8333-333333333333') as heads,
    (select count(*) from public.operator_intelligence_claim_revisions
        where operator_id = '33333333-3333-4333-8333-333333333333') as revisions,
    (select count(*) from public.operator_intelligence_eligibility_assessments
        where operator_id = '33333333-3333-4333-8333-333333333333') as eligibility,
    (select count(*) from public.operator_intelligence_evidence
        where operator_id = '33333333-3333-4333-8333-333333333333') as evidence,
    (select count(*) from public.operator_intelligence_claim_evidence
        where operator_id = '33333333-3333-4333-8333-333333333333') as links;
