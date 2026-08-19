# Sales Automation Interactive UI Prototype

Static HTML, CSS, and JavaScript prototypes for evaluating the proposed Surya Sai Solar sales automation experience.

The experience is organized around a live operating loop: lead events enter a workspace stream, assignment and SLA rules run immediately, representatives acknowledge and act from mobile, and managers intervene through an operational command center.

For the connected demo, open the manager portal and mobile app in separate tabs. Simulate a web enquiry in the portal, then accept it or record activity in mobile; browser-local events update the other view without refresh.

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
- Watch acknowledgement and first-touch countdowns update without refreshing.
- Simulate an incoming website enquiry and see it enter the event and intervention queues.
- Monitor live representative presence, survey activity, proposal views, and SLA breaches.
- Cycle through workspaces using the workspace selector.
- Search and filter leads.
- Open lead details from dashboards, tables, or pipeline cards.
- Simulate calls, WhatsApp, tasks, notes, and notifications.
- Create a lead with normalized phone feedback.

## Mobile App Interactions

- Navigate Today, Leads, Call, and Settings.
- Accept or return a timed assignment and see the first-touch SLA begin.
- Open a lead and inspect its activity timeline.
- Search and filter mobile leads.
- Enter a new phone number to create a lead before the simulated call.
- Complete a structured call outcome and next action.
- Check in to a site survey and capture qualification evidence.
- Enable offline mode and observe queued activity synchronization.

## Prototype Limitations

- All data is fictional and browser-local.
- Actions do not call the existing Azure APIs.
- The dialer and WhatsApp interactions are simulated.
- Authentication, authorization, and event synchronization are represented visually but not implemented.

## Related Design Documents

- [Lead creation plan](../lead-creation-plan.md)
- [Workflow diagrams](../lead-creation-workflow.md)

