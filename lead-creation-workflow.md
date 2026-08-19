# Lead Creation and Synchronization Workflows

**Status**: Proposed for evaluation  
**Date**: 2026-08-19  
**Implementation plan**: [lead-creation-plan.md](lead-creation-plan.md)
**Rendered overview**: [lead-creation-workflow.svg](lead-creation-workflow.svg)  
**Editable Mermaid source**: [lead-creation-workflow.mmd](lead-creation-workflow.mmd)

## 1. Complete End-to-End Workflow

```mermaid
flowchart LR
    subgraph currentSystem["Current Surya Sai System"]
        referralInput["User submits referral"]
        registrationInput["User registers prospect proactively"]
        normalizeCurrent["Normalize and validate phone"]
        currentLookup{"Customer exists?"}
        currentSave["Save referral and create or link customer"]
        currentOutbox["Commit integration event to transactional outbox"]
    end

    subgraph salesApp["Sales Android App"]
        dialInput["Sales rep enters new number"]
        normalizeCall["Normalize and validate phone"]
        callLeadLookup["Request lead upsert"]
        launchDialer["Persist activity then launch dialer"]
        captureOutcome["Capture call result and next action"]
        offlineOutbox["Encrypted offline activity outbox"]
    end

    subgraph integration["Integration Pipeline"]
        eventPublisher["Outbox publisher"]
        integrationQueue["Lead integration queue"]
        leadConsumer["Idempotent lead ingestion worker"]
        deadLetter["Dead-letter queue and replay"]
        reconciliation["Scheduled reconciliation"]
    end

    subgraph salesPlatform["Sales Automation Platform"]
        authorizeWorkspace["Authorize workspace and integration identity"]
        normalizeSales["Canonicalize phone to E.164"]
        leadLookup{"Lead exists for workspace and phone?"}
        createLead["Create minimal lead"]
        enrichLead["Enrich existing lead"]
        appendSource["Append source and activity history"]
        assignmentCheck{"Owner exists and is active?"}
        assignLead["Assign by relationship, territory or round robin"]
        keepOwner["Preserve current owner"]
        createTask["Create or retain dated next action"]
        notifyOwner["Notify owner and update team queue"]
    end

    subgraph data["Authoritative Data"]
        currentDb[("Customer and referral database")]
        outboxDb[("Transactional outbox")]
        salesDb[("Lead, activity and task database")]
        auditDb[("Processed events and audit log")]
    end

    referralInput --> normalizeCurrent
    registrationInput --> normalizeCurrent
    normalizeCurrent --> currentLookup
    currentLookup -->|"Yes"| currentSave
    currentLookup -->|"No"| currentSave
    currentSave --> currentDb
    currentSave --> currentOutbox
    currentOutbox --> outboxDb
    eventPublisher -->|"Read committed events"| outboxDb
    eventPublisher --> integrationQueue
    integrationQueue --> leadConsumer
    leadConsumer --> authorizeWorkspace

    dialInput --> normalizeCall
    normalizeCall --> callLeadLookup
    callLeadLookup --> authorizeWorkspace
    callLeadLookup -.->|"Offline"| offlineOutbox
    offlineOutbox -.->|"Retry when online"| callLeadLookup

    authorizeWorkspace --> normalizeSales
    normalizeSales --> leadLookup
    leadLookup -->|"No"| createLead
    leadLookup -->|"Yes"| enrichLead
    createLead --> appendSource
    enrichLead --> appendSource
    appendSource --> salesDb
    appendSource --> auditDb
    appendSource --> assignmentCheck
    assignmentCheck -->|"No"| assignLead
    assignmentCheck -->|"Yes"| keepOwner
    assignLead --> createTask
    keepOwner --> createTask
    createTask --> salesDb
    createTask --> notifyOwner

    callLeadLookup -->|"Lead and activity returned"| launchDialer
    launchDialer --> captureOutcome
    captureOutcome -->|"Update activity, stage and task"| salesDb

    leadConsumer -.->|"Permanent failure"| deadLetter
    deadLetter -.->|"Approved replay"| integrationQueue
    reconciliation -.->|"Find missing lead links"| currentDb
    reconciliation -.->|"Repair through ingestion"| integrationQueue
```

## 2. Referral and Proactive Registration Sequence

```mermaid
sequenceDiagram
    actor User
    participant CurrentApp as Current App
    participant CurrentApi as Current System API
    participant CurrentDb as Customer Database
    participant Outbox as Transactional Outbox
    participant Publisher as Outbox Publisher
    participant Queue as Integration Queue
    participant Ingestion as Lead Ingestion Worker
    participant SalesDb as Sales Database
    participant Assignment as Assignment and Task Engine
    participant Notification as Notification Service

    User->>CurrentApp: Submit referral or proactive registration
    CurrentApp->>CurrentApi: Phone, name, referral and workspace context
    CurrentApi->>CurrentApi: Normalize phone to E.164
    CurrentApi->>CurrentDb: Find customer by normalized phone

    alt Customer already exists
        CurrentApi->>CurrentDb: Link referral or update allowed fields
    else Customer does not exist
        CurrentApi->>CurrentDb: Create provisional or full customer
    end

    CurrentApi->>CurrentDb: Save referral
    CurrentApi->>Outbox: Save versioned event in same transaction
    CurrentApi-->>CurrentApp: Registration or referral accepted

    Publisher->>Outbox: Read committed unacknowledged event
    Publisher->>Queue: Publish event with event and correlation IDs
    Queue->>Ingestion: Deliver event
    Ingestion->>Ingestion: Authorize workspace and normalize phone
    Ingestion->>SalesDb: Find lead by workspace and normalized phone

    alt Lead does not exist
        Ingestion->>SalesDb: Create lead and source
    else Lead already exists
        Ingestion->>SalesDb: Merge trusted fields and append source
    end

    Ingestion->>SalesDb: Append activity and processed event record
    Ingestion->>Assignment: Ensure owner and dated next action
    Assignment->>SalesDb: Save assignment and task
    Assignment->>Notification: Notify assigned representative
    Ingestion-->>Queue: Acknowledge successful processing
    Publisher->>Outbox: Mark event acknowledged
```

## 3. New-Number Outbound Call Sequence

```mermaid
sequenceDiagram
    actor Rep as Sales Representative
    participant Mobile as Sales Android App
    participant SalesApi as Sales Platform API
    participant SalesDb as Sales Database
    participant Dialer as Android Dialer
    participant Outbox as Mobile Offline Outbox
    participant TaskEngine as Task and Assignment Engine

    Rep->>Mobile: Enter phone and tap Call
    Mobile->>Mobile: Normalize and validate phone

    alt Device is online
        Mobile->>SalesApi: Upsert lead and create CallInitiated activity
        SalesApi->>SalesApi: Authorize workspace membership
        SalesApi->>SalesDb: Find lead by workspace and normalized phone

        alt Lead does not exist
            SalesApi->>SalesDb: Create minimal OutboundCall lead
            SalesApi->>TaskEngine: Assign owner and create initial task
        else Lead exists
            SalesApi->>SalesDb: Preserve lead and append call source
        end

        SalesApi->>SalesDb: Save idempotent CallInitiated activity
        SalesApi-->>Mobile: Lead ID and Activity ID
    else Device is offline
        Mobile->>Outbox: Save provisional lead and activity with client UUIDs
    end

    Mobile->>Dialer: Launch call only after persist or local queue
    Dialer-->>Mobile: Call state and available duration
    Mobile->>Rep: Request structured outcome and next action
    Rep->>Mobile: Save outcome

    alt Device is online
        Mobile->>SalesApi: Complete activity and update lead
        SalesApi->>SalesDb: Save outcome, qualification and stage
        SalesApi->>TaskEngine: Complete old task and create next action
        TaskEngine->>SalesDb: Save dated next action
        SalesApi-->>Mobile: Return authoritative lead state
    else Device is offline
        Mobile->>Outbox: Queue completion and next action
        Outbox->>SalesApi: Synchronize idempotently when online
        SalesApi->>SalesDb: Reconcile client UUIDs with authoritative IDs
    end
```

## 4. Lead Upsert Decision Flow

```mermaid
flowchart TD
    receiveInput["Receive referral, customer or call event"] --> validateSchema{"Schema and workspace valid?"}
    validateSchema -->|"No"| rejectEvent["Reject or dead-letter with reason"]
    validateSchema -->|"Yes"| normalizePhone["Normalize phone to E.164"]
    normalizePhone --> validPhone{"Phone valid?"}
    validPhone -->|"No"| rejectEvent
    validPhone -->|"Yes"| eventSeen{"Event ID already processed?"}
    eventSeen -->|"Yes"| returnPrevious["Return previous processing result"]
    eventSeen -->|"No"| findLead["Find by workspace and normalized phone"]
    findLead --> leadFound{"Lead found?"}
    leadFound -->|"No"| createLead["Insert minimal lead"]
    leadFound -->|"Yes"| loadLead["Load lead and version"]
    createLead --> appendSource["Append source and activity"]
    loadLead --> compareConfidence{"Incoming field has higher confidence?"}
    compareConfidence -->|"Yes"| mergeFields["Merge allowed profile fields"]
    compareConfidence -->|"No"| preserveFields["Preserve authoritative fields"]
    mergeFields --> appendSource
    preserveFields --> appendSource
    appendSource --> ownerValid{"Active owner exists?"}
    ownerValid -->|"No"| assignOwner["Run workspace assignment rules"]
    ownerValid -->|"Yes"| preserveOwner["Keep existing owner"]
    assignOwner --> ensureTask["Ensure dated next action"]
    preserveOwner --> ensureTask
    ensureTask --> recordProcessed["Commit lead changes, event result and audit"]
    recordProcessed --> notify["Notify owner if action is required"]
    notify --> success["Acknowledge event or API request"]
```

## 5. Lead State Workflow

```mermaid
stateDiagram-v2
    [*] --> New: Referral, registration or new-number call
    New --> ContactAttempted: Completed contact attempt
    New --> Nurture: Future interest
    New --> Lost: Invalid or disqualified
    ContactAttempted --> Qualified: Need and intent confirmed
    ContactAttempted --> Nurture: Follow up later
    ContactAttempted --> Lost: Not interested or unreachable policy met
    Qualified --> QuotePrepared: Quote created
    Qualified --> Nurture: Timing deferred
    QuotePrepared --> Negotiation: Quote discussed
    QuotePrepared --> Lost: Quote rejected
    Negotiation --> Won: Customer accepts
    Negotiation --> Lost: Opportunity closed
    Nurture --> ContactAttempted: Reactivation task due
    Lost --> New: Authorized reopen
    Won --> [*]
```

## 6. Phone Identity and Deduplication

```mermaid
flowchart LR
    rawPhone["Raw phone input"] --> cleanPhone["Remove formatting and trunk prefix"]
    cleanPhone --> applyCountry["Apply explicit or workspace default country code"]
    applyCountry --> e164Phone["Validate and format as E.164"]
    e164Phone --> canonicalKey["Build WorkspaceId plus NormalizedPhone"]
    canonicalKey --> uniqueLookup{"Canonical lead exists?"}
    uniqueLookup -->|"No"| insertLead["Create lead under unique database constraint"]
    uniqueLookup -->|"Yes"| updateLead["Enrich lead and append source"]
    insertLead --> concurrencyCheck{"Concurrent insert conflict?"}
    concurrencyCheck -->|"Yes"| rereadWinner["Read winning lead and update it"]
    concurrencyCheck -->|"No"| returnLead["Return authoritative LeadId"]
    rereadWinner --> returnLead
    updateLead --> returnLead
```

## 7. Operational Failure and Recovery Flow

```mermaid
flowchart TD
    committedEvent["Current-system transaction committed"] --> publishAttempt["Publisher attempts delivery"]
    publishAttempt --> delivered{"Delivered to queue?"}
    delivered -->|"No"| retryPublish["Retry with exponential backoff and jitter"]
    retryPublish --> publishAttempt
    delivered -->|"Yes"| consumeAttempt["Ingestion worker processes event"]
    consumeAttempt --> result{"Processing result"}
    result -->|"Success"| acknowledge["Acknowledge queue and outbox"]
    result -->|"Transient failure"| retryConsume["Retry without changing event ID"]
    retryConsume --> consumeAttempt
    result -->|"Permanent validation failure"| deadLetter["Move to dead-letter queue"]
    deadLetter --> supportReview["Support reviews reason and source data"]
    supportReview --> replayDecision{"Safe to replay?"}
    replayDecision -->|"Yes"| replay["Republish same event ID after correction"]
    replay --> consumeAttempt
    replayDecision -->|"No"| closeFailure["Close with audited resolution"]
    acknowledge --> reconciliation["Scheduled reconciliation checks source-to-lead link"]
    reconciliation --> missing{"Missing or inconsistent?"}
    missing -->|"Yes"| repairEvent["Create repair event through same ingestion path"]
    repairEvent --> consumeAttempt
    missing -->|"No"| complete["Synchronization complete"]
```

## 8. Important Behavioral Rules

- The canonical lead identity is `(WorkspaceId, NormalizedPhoneNumber)`.
- Referral, registration, and call paths always use the same lead-upsert service.
- A second source enriches a lead; it does not create another lead.
- Existing owner and advanced stage are preserved unless an explicit authorized rule changes them.
- A new-number call creates or locally queues the lead before opening the dialer.
- Every active lead is assigned or visible in the workspace's unassigned queue.
- Every active lead has a dated next action.
- Integration event and mobile activity IDs make every retry idempotent.
- Failures are retried, dead-lettered, replayable, audited, and reconciled.

