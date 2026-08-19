# Solar Sales Automation Prototype

An interactive product prototype for evaluating Surya Sai Solar's connected sales workflow. It demonstrates how managers and field sales representatives can manage leads, monitor pipelines, make calls, record outcomes, and schedule follow-ups from desktop and mobile experiences.

## Live prototype

[Open the prototype on Netlify](https://solar-sales-automation-prototype.netlify.app)

## Included experiences

- **Manager web portal** for lead oversight, SLA monitoring, assignment, team management, and pipeline tracking.
- **Sales representative mobile app** for daily queues, lead lookup, calls, outcomes, follow-ups, and offline synchronization simulation.
- **Lead creation workflow documentation** covering workspace-aware identity, phone normalization, deduplication, and reliable synchronization.

## Run locally

The prototype is static HTML, CSS, and JavaScript and requires no build step or backend.

```bash
python3 -m http.server 8080 --directory prototype
```

Then open [http://localhost:8080](http://localhost:8080).

## Project structure

- `prototype/` — interactive web and mobile UI prototype.
- `lead-creation-plan.md` — proposed lead creation and synchronization design.
- `lead-creation-workflow.md` — supporting workflow documentation.
- `lead-creation-workflow.svg` — rendered workflow diagram.

## Limitations

All prototype data is fictional and stored in the browser. Dialer, WhatsApp, authentication, authorization, backend APIs, and event synchronization are simulated rather than production integrations.
