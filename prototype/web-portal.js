const leadProfiles = {
  sanjay: {
    name: "Sanjay Verma",
    initials: "SV",
    phone: "+91 91234 56078",
    location: "Jubilee Hills",
    stage: "New",
    owner: "Unassigned",
    source: "Website enquiry",
    next: "Accept and call within 10 min",
    bill: "₹9,200",
    system: "Residential rooftop",
  },
  ananya: {
    name: "Ananya Reddy",
    initials: "AR",
    phone: "+91 98765 43210",
    location: "Hyderabad",
    stage: "New",
    owner: "Priya Sharma",
    source: "Referral",
    next: "Call now",
    bill: "₹5,000",
    system: "3 kW rooftop",
  },
  vikram: {
    name: "Vikram Kumar",
    initials: "VK",
    phone: "+91 98480 11672",
    location: "Secunderabad",
    stage: "New",
    owner: "Ravi Teja",
    source: "Quotation",
    next: "First call in 8 min",
    bill: "₹7,800",
    system: "5 kW rooftop",
  },
  meera: {
    name: "Meera Iyer",
    initials: "MI",
    phone: "+91 99630 88442",
    location: "Gachibowli",
    stage: "Qualified",
    owner: "Ravi Teja",
    source: "Outbound call",
    next: "Site visit at 2:30 PM",
    bill: "₹4,400",
    system: "3 kW rooftop",
  },
  arjun: {
    name: "Arjun Naik",
    initials: "AN",
    phone: "+91 97012 44018",
    location: "Kukatpally",
    stage: "Contacted",
    owner: "Sneha Mehta",
    source: "Contact form",
    next: "Proposal call at 4 PM",
    bill: "₹28,000",
    system: "18 kW commercial",
  },
  karthik: {
    name: "Karthik Rao",
    initials: "KR",
    phone: "+91 93982 77201",
    location: "Kondapur",
    stage: "Quote prepared",
    owner: "Priya Sharma",
    source: "Referral",
    next: "Share revision tomorrow",
    bill: "₹8,100",
    system: "5 kW rooftop",
  },
  saira: {
    name: "Saira Begum",
    initials: "SB",
    phone: "+91 99890 11435",
    location: "Tolichowki",
    stage: "Contacted",
    owner: "Ajay Kumar",
    source: "Outbound call",
    next: "WhatsApp brochure at 5:15 PM",
    bill: "₹3,600",
    system: "2 kW rooftop",
  },
  rohan: {
    name: "Rohan Patel",
    initials: "RP",
    phone: "+91 98490 12678",
    location: "Miyapur",
    stage: "Qualified",
    owner: "Sneha Mehta",
    source: "Quotation",
    next: "Roof assessment Friday",
    bill: "₹6,200",
    system: "4 kW rooftop",
  },
};

const viewTitles = {
  dashboard: "Command center",
  leads: "Lead workspace",
  pipeline: "Pipeline board",
  team: "Team activity",
  automation: "Automation",
  settings: "Workspace settings",
};

const navItems = [...document.querySelectorAll(".nav-item[data-view]")];
const views = [...document.querySelectorAll(".view")];
const drawer = document.getElementById("leadDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const modalOverlay = document.getElementById("modalOverlay");
const modal = document.getElementById("newLeadModal");
const toastStack = document.getElementById("toastStack");
let lastEventSeconds = 0;

function formatTimer(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateLiveOperations() {
  const clock = document.getElementById("liveClock");
  if (clock) {
    clock.textContent = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  }

  document.querySelectorAll("[data-countdown]").forEach((element) => {
    const next = Math.max(0, Number(element.dataset.countdown) - 1);
    element.dataset.countdown = String(next);
    element.textContent = formatTimer(next);
    if (next <= 120) element.classList.add("timer-critical");
  });

  document.querySelectorAll("[data-countup]").forEach((element) => {
    const next = Number(element.dataset.countup) + 1;
    element.dataset.countup = String(next);
    element.textContent = formatTimer(next);
  });

  lastEventSeconds += 1;
  const age = document.getElementById("lastEventAge");
  if (age) age.textContent = lastEventSeconds < 5 ? "now" : `${lastEventSeconds}s ago`;
}

window.setInterval(updateLiveOperations, 1000);

function prependLiveEvent(title, description, eventId) {
  const feed = document.getElementById("liveEventFeed");
  const item = document.createElement("div");
  item.className = "feed-item event-new";
  item.innerHTML =
    `<strong>${title}</strong>${description}` +
    `<time>just now · ${String(eventId).slice(0, 12)}</time>`;
  feed.prepend(item);
  lastEventSeconds = 0;
}

window.salesRealtime?.subscribe((event) => {
  if (event.type === "assignment.accepted") {
    leadProfiles.sanjay.owner = event.payload.owner;
    const row = document.querySelector('[data-lead="sanjay"].incoming-row');
    const badge = row?.querySelector(".badge");
    if (badge) {
      badge.textContent = "Accepted by Ravi";
      badge.className = "badge badge-success";
    }
    prependLiveEvent(
      "ASSIGNMENT_ACCEPTED · Sanjay Verma",
      "Ravi accepted from mobile. First-touch SLA is now running.",
      event.eventId,
    );
    showToast("Mobile update received · Ravi accepted Sanjay");
  }

  if (event.type === "assignment.rejected") {
    const row = document.querySelector('[data-lead="sanjay"].incoming-row');
    const badge = row?.querySelector(".badge");
    if (badge) {
      badge.textContent = "Rerouting";
      badge.className = "badge badge-due";
    }
    prependLiveEvent(
      "ASSIGNMENT_REJECTED · Sanjay Verma",
      "Ravi is unavailable. Original first-touch SLA preserved while rerouting.",
      event.eventId,
    );
    showToast("Assignment returned · routing to next available rep");
  }

  if (event.type === "contact.outcome") {
    prependLiveEvent(
      `CONTACT_OUTCOME_RECORDED · ${event.payload.leadName}`,
      `${event.payload.outcome}. Next: ${event.payload.nextAction}`,
      event.eventId,
    );
    showToast("Rep outcome synchronized to command center");
  }

  if (event.type === "survey.started") {
    prependLiveEvent(
      `SURVEY_STARTED · ${event.payload.leadName}`,
      `${event.payload.owner} checked in from the customer location.`,
      event.eventId,
    );
    showToast("Live survey check-in received");
  }
});

function icon(name) {
  return `<svg class="icon icon-sm"><use href="#i-${name}"></use></svg>`;
}

function activateView(viewName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  views.forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });
  document.title = `${viewTitles[viewName] ?? "Sales Command"} · Surya Sai Solar`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => activateView(item.dataset.view));
});

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => activateView(button.dataset.viewTarget));
});

function openLeadDrawer(leadId) {
  const profile = leadProfiles[leadId] ?? leadProfiles.ananya;
  const fieldMap = {
    drawerName: profile.name,
    drawerAvatar: profile.initials,
    drawerPhone: profile.phone,
    drawerLocation: profile.location,
    drawerStage: profile.stage,
    drawerOwner: profile.owner,
    drawerSource: profile.source,
    drawerNext: profile.next,
    drawerBill: profile.bill,
    drawerSystem: profile.system,
  };

  Object.entries(fieldMap).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });

  drawer.classList.add("open");
  drawerOverlay.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLeadDrawer() {
  drawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-lead]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openLeadDrawer(button.dataset.lead);
  });
});

document.getElementById("closeDrawer").addEventListener("click", closeLeadDrawer);
drawerOverlay.addEventListener("click", closeLeadDrawer);

function openModal() {
  modal.classList.add("open");
  modalOverlay.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => document.getElementById("newPhone").focus(), 180);
}

function closeModal() {
  modal.classList.remove("open");
  modalOverlay.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll('[data-open-modal="newLead"]').forEach((button) => {
  button.addEventListener("click", openModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

modalOverlay.addEventListener("click", closeModal);

function showToast(message, timeout = 2800) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${icon("zap")}<span>${message}</span>`;
  toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-5px)";
    window.setTimeout(() => toast.remove(), 180);
  }, timeout);
}

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.getElementById("newLeadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const rawPhone = String(form.get("phone") || "").replace(/\D/g, "");
  const normalized = rawPhone.startsWith("91")
    ? `+${rawPhone}`
    : `+91${rawPhone.slice(-10)}`;
  const name = String(form.get("name") || "New lead");
  closeModal();
  event.currentTarget.reset();
  showToast(`${name} created and assigned · ${normalized}`);
});

function applyLeadFilters() {
  const search = document.getElementById("leadSearch").value.trim().toLowerCase();
  const stage = document.getElementById("stageFilter").value;
  const source = document.getElementById("sourceFilter").value;
  const rows = [...document.querySelectorAll("#leadRows tr")];
  let visibleCount = 0;

  rows.forEach((row) => {
    const matchesSearch = !search || row.dataset.name.includes(search);
    const matchesStage = stage === "all" || row.dataset.stage === stage;
    const matchesSource = source === "all" || row.dataset.source === source;
    const visible = matchesSearch && matchesStage && matchesSource;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  document.getElementById("leadCount").textContent = String(visibleCount);
  document.getElementById("leadTableWrap").style.display =
    visibleCount > 0 ? "block" : "none";
  document.getElementById("leadEmpty").classList.toggle("visible", visibleCount === 0);
}

["leadSearch", "stageFilter", "sourceFilter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", applyLeadFilters);
  document.getElementById(id).addEventListener("change", applyLeadFilters);
});

document.getElementById("globalSearch").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  activateView("leads");
  const leadSearch = document.getElementById("leadSearch");
  leadSearch.value = event.currentTarget.value;
  applyLeadFilters();
  leadSearch.focus();
});

const workspaces = ["Hyderabad Central", "Secunderabad North", "Commercial Projects"];
let workspaceIndex = 0;
document.getElementById("workspaceSwitch").addEventListener("click", () => {
  workspaceIndex = (workspaceIndex + 1) % workspaces.length;
  const workspace = workspaces[workspaceIndex];
  document.getElementById("workspaceName").textContent = workspace;
  showToast(`Switched to ${workspace}`);
});

document.getElementById("notificationButton").addEventListener("click", () => {
  showToast("3 new leads need first contact within 10 minutes");
});

document.getElementById("simulateLeadButton").addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (button.disabled) return;
  if (document.querySelector('[data-lead="sanjay"].incoming-row')) {
    showToast("Sanjay is already in the live intervention queue");
    return;
  }
  button.disabled = true;
  button.textContent = "Receiving event…";

  window.setTimeout(() => {
    prependLiveEvent(
      "LEAD_CREATED · Sanjay Verma",
      "Website enquiry matched Jubilee Hills. Assignment offer sent to Ravi.",
      "evt_8F22",
    );

    const queue = document.querySelector("#view-dashboard .priority-list");
    const row = document.createElement("button");
    row.className = "priority-row incoming-row";
    row.type = "button";
    row.dataset.lead = "sanjay";
    row.innerHTML =
      '<span class="person-cell"><span class="avatar blue">SV</span><span><strong>Sanjay Verma</strong><span>+91 91234 56078</span></span></span>' +
      '<span class="priority-meta"><strong>Website enquiry</strong><span>₹9,200 bill · Jubilee Hills</span></span>' +
      '<span><span class="badge badge-new">Assigning</span></span>' +
      '<span class="priority-time"><strong data-countdown="600">10:00</strong><span>first touch</span></span>';
    row.addEventListener("click", () => openLeadDrawer("sanjay"));
    queue.prepend(row);

    document.getElementById("unassignedMetric").textContent = "03";
    document.getElementById("slaRiskMetric").textContent = "10";
    document.getElementById("eventLatency").textContent = "0.8s";
    button.disabled = false;
    button.innerHTML = `${icon("zap")}Simulate web enquiry`;
    window.salesRealtime?.publish("lead.assigned", {
      leadId: "sanjay",
      leadName: "Sanjay Verma",
      owner: "Ravi Teja",
      acceptBySeconds: 90,
    });
    showToast("Live event received · Sanjay entered assignment queue");
  }, 900);
});

document.getElementById("newRuleButton").addEventListener("click", () => {
  showToast("Rule builder would open here");
});

document.getElementById("saveSettingsButton").addEventListener("click", () => {
  showToast("Workspace settings saved");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLeadDrawer();
    closeModal();
  }
});
