# Sales Automation Interactive UI Prototype

Static HTML, CSS, and JavaScript prototypes for evaluating the proposed Surya Sai Solar sales automation experience.

## Start

From the repository root:

```bash
python3 -m http.server 8080 --directory DOC/sales-automation/prototype
```

Open:

```text
http://localhost:8080
```

The prototypes do not require a build step or backend.

## Files

- `index.html`: prototype selector.
- `web-portal.html`: manager and operations web portal.
- `web-portal.js`: portal navigation, filters, lead drawer, workspace switching, and forms.
- `mobile-app.html`: sales representative mobile app.
- `mobile-app.js`: daily queue, lead search, new-number calling, outcomes, and offline simulation.
- `styles.css`: shared responsive visual system.

## Web Portal Interactions

- Switch between command center, leads, pipeline, team, automation, and settings.
- Cycle through workspaces using the workspace selector.
- Search and filter leads.
- Open lead details from dashboards, tables, or pipeline cards.
- Simulate calls, WhatsApp, tasks, notes, and notifications.
- Create a lead with normalized phone feedback.

## Mobile App Interactions

- Navigate Today, Leads, Call, and Settings.
- Open a lead and inspect its activity timeline.
- Search and filter mobile leads.
- Enter a new phone number to create a lead before the simulated call.
- Complete a structured call outcome and next action.
- Enable offline mode and observe queued activity synchronization.

## Prototype Limitations

- All data is fictional and browser-local.
- Actions do not call the existing Azure APIs.
- The dialer and WhatsApp interactions are simulated.
- Authentication, authorization, and event synchronization are represented visually but not implemented.

## Related Design Documents

- [Lead creation plan](../lead-creation-plan.md)
- [Workflow diagrams](../lead-creation-workflow.md)

