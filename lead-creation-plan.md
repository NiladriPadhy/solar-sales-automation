# Sales Automation Lead Creation and Synchronization Plan

**Status**: Proposed for evaluation  
**Date**: 2026-08-19  
**Related workflow**: [lead-creation-workflow.md](lead-creation-workflow.md)

## 1. Objective

Create or update a sales lead whenever:

1. An existing user submits a referral for another person.
2. A user is proactively registered in the current Surya Sai system.
3. A sales representative initiates a call to a phone number that is not already associated with a lead in the representative's workspace.

All three paths MUST converge on one lead record. Phone number is the lead's primary business identity, but it MUST be normalized and scoped to a workspace.

## 2. Key Decisions

### 2.1 Canonical lead key

Use the following canonical key:

```text
LeadKey = WorkspaceId + NormalizedPhoneNumber
```

- Store phone numbers in E.164 format, for example `+919876543210`.
- Default unqualified Indian 10-digit numbers to country code `+91`.
- Remove spaces, hyphens, brackets, and trunk prefix before matching.
- Preserve the originally entered value separately for audit and display.
- Enforce a unique database constraint on `(WorkspaceId, NormalizedPhoneNumber)`.
- Do not enforce global phone uniqueness across workspaces because the same person may legitimately interact with multiple businesses or operating units.

### 2.2 Lead creation is an idempotent upsert

The sales platform MUST expose an idempotent lead-ingestion operation. It creates a lead only when the canonical key does not exist. Otherwise, it enriches the existing lead and appends a source/activity record.

Example:

```http
PUT /api/workspaces/{workspaceId}/leads/by-phone/{normalizedPhone}
Idempotency-Key: {eventId}
```

The operation MUST NOT overwrite verified customer data with lower-confidence referral or call data.

### 2.3 Near-real-time consistency instead of distributed dual writes

The current system and sales platform are separate transactional boundaries. A referral/customer transaction cannot be atomically committed in both systems without distributed transaction infrastructure.

Use the transactional outbox pattern:

1. Save the referral or customer and an outbox event in one current-system database transaction.
2. Publish the outbox event after commit.
3. Consume and upsert the lead in the sales platform.
4. Retry safely using `EventId` as the idempotency key.

This produces reliable near-real-time synchronization and prevents a successful customer registration from being rolled back because the sales platform is temporarily unavailable.

## 3. Scope

### Included

- Workspace-aware lead identity and access.
- Referral-triggered lead creation.
- Proactive registration-triggered lead creation.
- Outbound-call-triggered lead creation.
- Phone normalization, validation, deduplication, and merge.
- Lead source history and activity timeline.
- Automatic assignment, next action, notifications, retries, and audit.
- Existing lead enrichment instead of duplicate creation.

### Excluded from the first release

- Automatic merging of leads across workspaces.
- Unattended AI changes to customer identity or lead stage.
- WhatsApp backup extraction.
- Dependence on automatic Android call recording.
- Cross-workspace customer data exposure.

## 4. Roles and Workspaces

### Workspace

A workspace is the security, configuration, and data-isolation boundary. It owns:

- Users and role memberships.
- Territories and assignment rules.
- Leads, activities, tasks, and pipelines.
- Notification and automation settings.
- Integrations and API credentials.

### Roles

- **Customer/User**: can submit a referral and register a referred person when allowed.
- **Sales Representative**: sees assigned leads, initiates calls, records outcomes, and schedules follow-ups.
- **Manager**: sees reportee/team workspaces, assigns leads, and handles SLA exceptions.
- **Administrator**: configures workspace rules, roles, sources, and integrations.
- **Integration Worker**: service identity permitted only to ingest events and update synchronization status.

Server-side authorization MUST enforce workspace membership and territory/reportee scope. A client-supplied `WorkspaceId` is never sufficient authorization.

## 5. Canonical Domain Model

### Lead

Required fields:

- `LeadId`
- `WorkspaceId`
- `NormalizedPhoneNumber`
- `OriginalPhoneNumber`
- `DisplayName`
- `Stage`
- `OwnerUserId`
- `TerritoryId`
- `Priority`
- `FirstSource`
- `LatestSource`
- `CustomerId`
- `CreatedAtUtc`
- `UpdatedAtUtc`
- `Version`

Optional solar qualification fields:

- State, city, pincode
- Monthly electricity bill
- Property type
- Solar type
- Estimated system capacity
- EMI interest
- Preferred language

### LeadSource

One lead can have multiple sources:

- `Referral`
- `ProactiveRegistration`
- `OutboundCall`
- `Quotation`
- `ContactUs`
- `WhatsApp`
- `Manual`

Each source record stores `SourceEntityId`, `SourceUserId`, `OccurredAtUtc`, `Campaign`, `ReferralCode`, and correlation metadata.

### Activity

Examples include referral received, user registered, call initiated, call connected, call completed, call outcome, note, WhatsApp message, site visit, assignment, and stage change.

### Task

Every active lead SHOULD have a next action:

- Owner
- Type
- Due date/time
- Priority
- Status
- Completion outcome
- Related activity

## 6. Integration Events

Use a versioned event envelope:

```json
{
  "eventId": "uuid",
  "eventType": "ReferralSubmitted.v1",
  "occurredAtUtc": "2026-08-19T08:30:00Z",
  "correlationId": "uuid",
  "workspaceId": "uuid",
  "actor": {
    "type": "User",
    "id": "uuid"
  },
  "subject": {
    "phoneNumber": "+919876543210",
    "displayName": "Prospective customer"
  },
  "source": {
    "entityType": "Referral",
    "entityId": "uuid"
  }
}
```

Required event types:

- `ReferralSubmitted.v1`
- `CustomerCreated.v1`
- `CustomerUpdated.v1`
- `OutboundCallInitiated.v1`
- `OutboundCallCompleted.v1`

If one user operation creates both a referral and customer, both events MAY be published. The shared `CorrelationId` and canonical lead key ensure they enrich one lead. Each `EventId` is processed once.

## 7. Workflow A: Referral Submission

1. Authenticated user selects the target workspace or the system derives it from the current customer channel.
2. User enters referred person's phone, name, city, and optional qualification details.
3. Current system normalizes and validates the phone.
4. Current system checks for an existing customer by normalized phone.
5. The user confirms that they have permission to share the person's details.
6. In one transaction, current system:
   - Creates the referral.
   - Links an existing customer or creates the proactive customer record if that behavior is enabled.
   - Writes `ReferralSubmitted.v1` to the outbox.
   - Writes `CustomerCreated.v1` to the outbox when a customer was created.
7. The API returns success immediately after the local transaction commits.
8. Outbox publisher sends the event to the integration queue.
9. Sales lead ingestion worker:
   - Validates workspace and schema.
   - Normalizes the phone again.
   - Finds the lead by `(WorkspaceId, NormalizedPhoneNumber)`.
   - Creates the lead or enriches the existing lead.
   - Appends referral/customer source records.
   - Adds a timeline activity.
10. Assignment engine assigns an owner from territory, source, workload, and availability rules.
11. Task engine creates the initial follow-up with the configured response SLA.
12. Push/WhatsApp notifications alert the owner as configured.
13. Integration status is acknowledged and observable by support staff.

### Referral duplicate behavior

- Existing lead: add the referral source and referral activity; do not create another lead.
- Existing customer without lead: create a lead linked to the customer.
- Existing referral with the same event: return the previous result.
- Multiple referrers for one phone: retain all referral source records; use a separate business rule to determine attribution and payout.

## 8. Workflow B: Proactive User Registration

1. Current system receives a registration request.
2. Normalize and validate phone.
3. Check whether the customer already exists.
4. Create or update the customer in one transaction.
5. Write `CustomerCreated.v1` or `CustomerUpdated.v1` to the outbox.
6. Publish and consume the event using the common ingestion pipeline.
7. Upsert lead by workspace and normalized phone.
8. Link `Lead.CustomerId` to the authoritative customer identifier.
9. Preserve existing lead owner and stage unless an explicit transition rule applies.
10. Add registration source/activity and ensure an appropriate next action exists.

Registration MUST NOT create a duplicate lead when a referral or outbound call already created it.

## 9. Workflow C: Sales Representative Calls a New Number

### Reliable supported path

The representative initiates the call from the sales Android app:

1. Rep enters or selects a phone number.
2. App normalizes the number locally for fast validation.
3. App calls the lead lookup/upsert endpoint with workspace context.
4. Sales platform atomically:
   - Finds the lead by canonical key.
   - Creates a minimal lead with source `OutboundCall` if absent.
   - Preserves and returns the existing lead if present.
   - Creates a `CallInitiated` activity with a unique `ClientActivityId`.
5. API returns `LeadId` and `ActivityId`.
6. App launches the system dialer.
7. When call state is available, the app records connected/completed state and duration.
8. Rep selects a structured outcome after the call.
9. System updates the activity, lead stage, qualification fields, and next action in one transaction.

### Calls made outside the app

Automatic detection of arbitrary device calls depends on Android permissions, distribution model, OEM behavior, and store policy. Therefore:

- Do not make outside-app detection an MVP dependency.
- Prefer in-app click-to-call as the supported workflow.
- If the app is enterprise-distributed and policy/legal review approves it, a call-state/call-log observer MAY emit `OutboundCallInitiated.v1`.
- The observer MUST use a local idempotent outbox because callbacks can repeat or arrive out of order.
- Call recording requires separate legal, consent, platform, and retention approval.

### Call duplicate behavior

- Existing lead: append call activity and return the existing lead.
- New phone: create a minimal lead before launching the dialer.
- Offline: create a provisional local lead/activity using client-generated UUIDs, place them in the encrypted outbox, and reconcile through the same upsert endpoint when connectivity returns.

## 10. Lead Upsert and Merge Rules

Field precedence from highest to lowest:

1. Verified customer profile.
2. Sales representative-confirmed value.
3. Quotation or registration form.
4. Referral-provided value.
5. AI-extracted value.
6. Call-only placeholder.

Rules:

- Never replace a non-empty higher-confidence field with a lower-confidence field.
- Preserve every source and activity even when profile fields are not changed.
- Customer link, consent, owner, and stage changes require audit records.
- Conflicting names or locations create a review flag.
- Concurrent ingestion uses the unique key plus optimistic concurrency/versioning.
- Database uniqueness violations are handled by re-reading and updating the winning lead.

## 11. Lead State and Next Action

Recommended initial stages:

```text
New -> Contact Attempted -> Qualified -> Quote Prepared -> Negotiation -> Won
                                                        \-> Lost
New/Contact Attempted/Qualified -> Nurture
```

Rules:

- New referral, registration, or call-created leads start at `New`, unless an existing lead is already further along.
- `CallInitiated` alone does not advance stage.
- Connected call plus saved outcome may move to `Contact Attempted` or `Qualified`.
- Every non-terminal stage requires an owner and dated next action.
- `Won` requires a linked customer and conversion record.
- `Lost` requires a reason and optional reactivation date.

## 12. Assignment

Assignment runs only when:

- Lead has no owner.
- Existing owner is inactive or outside the workspace/territory.
- An explicit transfer or rebalancing action occurs.

Suggested priority:

1. Existing relationship owner.
2. Referrer's mapped sales representative.
3. Territory/pincode team.
4. Round-robin among available representatives.
5. Workspace default queue.

Existing ownership MUST not be silently replaced when another source event arrives.

## 13. API Surface

Minimum endpoints:

```text
GET  /api/workspaces/{workspaceId}/leads/by-phone/{phone}
PUT  /api/workspaces/{workspaceId}/leads/by-phone/{phone}
GET  /api/workspaces/{workspaceId}/leads/{leadId}
POST /api/workspaces/{workspaceId}/leads/{leadId}/activities
PATCH /api/workspaces/{workspaceId}/leads/{leadId}/activities/{activityId}
POST /api/workspaces/{workspaceId}/leads/{leadId}/tasks
POST /api/workspaces/{workspaceId}/leads/{leadId}/assignments
POST /api/integrations/customer-events
GET  /api/integrations/events/{eventId}/status
```

All mutation endpoints require an idempotency key and return the authoritative `LeadId`.

## 14. Reliability and Failure Handling

- Outbox rows are retained until acknowledged.
- Retries use exponential backoff with jitter.
- Invalid events move to a dead-letter queue with reason and correlation ID.
- A replay tool can reprocess failed events without creating duplicate leads.
- Consumers record `EventId`, processing status, attempts, and result.
- Queue and worker health metrics include age of oldest event, failure rate, retry count, and dead-letter count.
- Reconciliation job compares recent customer/referral records with sales lead links and repairs missing synchronization.

## 15. Security, Privacy, and Consent

- Encrypt phone numbers and personally identifiable information in transit and at rest.
- Avoid logging raw phone numbers; use masked values or keyed hashes for diagnostics.
- Enforce workspace and role scope on every lookup and mutation.
- Record referral consent assertion and communication preferences.
- Apply do-not-contact and quiet-hour rules before automated messages or calls.
- Define retention/deletion propagation across customer and sales systems.
- Maintain immutable audit events for identity, assignment, consent, and stage changes.
- Obtain explicit consent before recording or transcribing any conversation.

## 16. Observability and KPIs

Technical:

- Event publish-to-lead latency.
- Event processing success and retry rate.
- Duplicate prevention count.
- Dead-letter queue depth.
- Reconciliation repairs.
- Call activity synchronization latency.

Business:

- Leads by source and workspace.
- Median time to assignment.
- Median time to first attempted and successful contact.
- Active leads without next action.
- Follow-up completion rate.
- Referral-to-qualified and registration-to-qualified conversion.
- Outbound new-number call-to-qualified conversion.

## 17. Testing Strategy

### Unit

- Indian and international phone normalization.
- Canonical key generation.
- Field precedence and merge behavior.
- Assignment and next-action rules.
- Event idempotency.

### Integration

- Current-system transaction writes domain data and outbox atomically.
- Duplicate and out-of-order event consumption.
- Concurrent events for the same workspace/phone.
- Retry after sales API or queue outage.
- Authorization and workspace isolation.

### End-to-end

1. Referral creates customer and exactly one lead.
2. Referral followed by registration enriches the same lead.
3. Registration followed by outbound call appends activity to the same lead.
4. New-number in-app call creates lead before dialer launch.
5. Offline call activity synchronizes once without duplicates.
6. Same phone in two workspaces produces isolated lead records.
7. Failed event is visible, replayable, and reconciled.

## 18. Delivery Slices

### Slice 1: Identity and ingestion

- Workspace model and role claims.
- Phone normalization library shared by APIs.
- Lead unique key and upsert endpoint.
- Event envelope, processed-event store, audit.

### Slice 2: Referral and registration synchronization

- Current-system outbox.
- Referral/customer event publisher.
- Sales consumer, lead source merge, assignment, initial task.
- Monitoring and reconciliation.

### Slice 3: In-app outbound calling

- Phone lookup/upsert.
- Call initiated/completed activity.
- Dialer launch, outcome form, next action.
- Offline activity outbox.

### Slice 4: Management and automation

- Team queues, SLA exceptions, replay support.
- Notification rules and workspace configuration.
- KPI dashboards and source conversion.

## 19. Acceptance Criteria

- A committed referral or customer registration produces a sales lead within the configured synchronization SLA.
- A new number dialed from the sales app has a persisted or locally queued lead before the dialer opens.
- Repeated, concurrent, and out-of-order events never create more than one lead per workspace and normalized phone.
- Existing lead sources, owner, stage, and timeline are preserved and enriched.
- Every active lead receives an owner or appears in the workspace's unassigned queue.
- Every active lead has a dated next action or an explicit SLA exception.
- Integration failures are retried, observable, replayable, and reconciled.
- Workspace boundaries prevent cross-workspace lead disclosure.

## 20. Decisions Required Before Implementation

1. Whether proactive referral registration creates a complete customer or a provisional prospect.
2. How the current customer channel maps to a default workspace.
3. Exact Indian/international phone validation rules.
4. Referral attribution when multiple users refer the same phone.
5. Assignment rules and response SLAs per workspace.
6. Android distribution model and whether outside-app call detection is legally and technically allowed.
7. Customer and lead data deletion/retention policy.

