const mobileLeads = {
  sanjay: {
    name: "Sanjay Verma",
    phone: "+91 91234 56078",
    location: "Jubilee Hills",
    source: "Website enquiry",
    bill: "₹9,200",
    system: "Residential rooftop",
    next: "First call within 10 minutes",
    badge: "Assigned",
    event: "Assignment accepted",
  },
  ananya: {
    name: "Ananya Reddy",
    phone: "+91 98765 43210",
    location: "Hyderabad",
    source: "Referral",
    bill: "₹5,000",
    system: "3 kW rooftop",
    next: "First call",
    badge: "New lead",
    event: "Referral received",
  },
  vikram: {
    name: "Vikram Kumar",
    phone: "+91 98480 11672",
    location: "Secunderabad",
    source: "Quotation",
    bill: "₹7,800",
    system: "5 kW rooftop",
    next: "First call",
    badge: "New lead",
    event: "Quotation submitted",
  },
  meera: {
    name: "Meera Iyer",
    phone: "+91 99630 88442",
    location: "Gachibowli",
    source: "Outbound call",
    bill: "₹4,400",
    system: "3 kW rooftop",
    next: "Site visit",
    badge: "Qualified",
    event: "New-number call completed",
  },
  rohan: {
    name: "Rohan Patel",
    phone: "+91 98490 12678",
    location: "Miyapur",
    source: "Quotation",
    bill: "₹6,200",
    system: "4 kW rooftop",
    next: "Roof assessment",
    badge: "Qualified",
    event: "Lead qualified",
  },
  arjun: {
    name: "Arjun Naik",
    phone: "+91 97012 44018",
    location: "Kukatpally",
    source: "Contact form",
    bill: "₹28,000",
    system: "18 kW commercial",
    next: "Proposal call",
    badge: "Contacted",
    event: "Call connected",
  },
};

const phoneShell = document.getElementById("phoneShell");
const screens = [...document.querySelectorAll(".mobile-screen")];
const navItems = [...document.querySelectorAll(".mobile-nav-item")];
const mobileFab = document.getElementById("mobileFab");
const toastStack = document.getElementById("mobileToastStack");
const outcomeSheet = document.getElementById("outcomeSheet");
const sheetOverlay = document.getElementById("mobileSheetOverlay");
const screenHistory = ["today"];
let currentScreen = "today";
let isOffline = false;
let activePhone = "";
let selectedOutcome = "Connected · qualified";
let activeStageTab = "all";
let assignmentSeconds = 90;
let assignmentTimer;

function startAssignmentTimer(seconds = 90) {
  window.clearInterval(assignmentTimer);
  assignmentSeconds = seconds;
  assignmentTimer = window.setInterval(() => {
    const countdown = document.getElementById("acceptCountdown");
    if (!countdown) return;
    assignmentSeconds = Math.max(0, assignmentSeconds - 1);
    countdown.textContent = `${String(Math.floor(assignmentSeconds / 60)).padStart(2, "0")}:${String(assignmentSeconds % 60).padStart(2, "0")}`;
    countdown.classList.toggle("timer-critical", assignmentSeconds <= 30);
    if (assignmentSeconds === 0) {
      window.clearInterval(assignmentTimer);
      document.getElementById("incomingAssignment").classList.add("assignment-expired");
      countdown.textContent = "Reassigned";
      showMobileToast("No acknowledgement · manager queue notified");
    }
  }, 1000);
}

startAssignmentTimer();

function mobileIcon(name) {
  return `<svg class="icon icon-sm"><use href="#i-${name}"></use></svg>`;
}

function showMobileToast(message, timeout = 2400) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${mobileIcon(isOffline ? "wifi-off" : "check")}<span>${message}</span>`;
  toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    window.setTimeout(() => toast.remove(), 180);
  }, timeout);
}

function showScreen(name, options = {}) {
  const { remember = true } = options;
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `mobile-${name}`);
  });
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.mobileView === name);
  });
  mobileFab.style.display = ["today", "leads"].includes(name) ? "grid" : "none";
  if (remember && currentScreen !== name) screenHistory.push(name);
  currentScreen = name;
}

document.querySelectorAll("[data-mobile-view]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.mobileView));
});

mobileFab.addEventListener("click", () => showScreen("dial"));

document.querySelectorAll("[data-mobile-back]").forEach((button) => {
  button.addEventListener("click", () => {
    if (screenHistory.length > 1) screenHistory.pop();
    showScreen(screenHistory.at(-1) || "today", { remember: false });
  });
});

function openMobileLead(leadId) {
  const lead = mobileLeads[leadId] || mobileLeads.ananya;
  const fields = {
    mobileDetailName: lead.name,
    mobileDetailPhone: lead.phone,
    mobileDetailLocation: lead.location,
    mobileDetailSource: lead.source,
    mobileDetailBill: lead.bill,
    mobileDetailSystem: lead.system,
    mobileDetailNext: lead.next,
    mobileDetailBadge: lead.badge,
    mobileDetailEvent: lead.event,
  };
  Object.entries(fields).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });
  activePhone = lead.phone;
  showScreen("detail");
}

document.querySelectorAll("[data-mobile-lead]").forEach((button) => {
  button.addEventListener("click", () => openMobileLead(button.dataset.mobileLead));
});

document.querySelectorAll("[data-mobile-toast]").forEach((button) => {
  button.addEventListener("click", () => showMobileToast(button.dataset.mobileToast));
});

document.getElementById("mobileBell").addEventListener("click", () => {
  showMobileToast("1 first-touch SLA at risk · 2 visits today");
});

function acceptAssignment() {
  window.clearInterval(assignmentTimer);
  const assignment = document.getElementById("incomingAssignment");
  assignment.classList.add("assignment-accepted");
  assignment.innerHTML =
    '<div class="incoming-head"><span class="assignment-pulse"></span><strong>Assignment accepted</strong><b>10:00</b></div>' +
    "<h3>Sanjay Verma · Jubilee Hills</h3>" +
    "<p>First-touch SLA is running. Customer requested a call now.</p>" +
    '<button class="btn btn-primary assignment-call" id="startAssignedCall" type="button">' +
    `${mobileIcon("phone")} Start first call</button>`;
  document.getElementById("mobileNowCount").textContent = "04";
  document.getElementById("startAssignedCall").addEventListener("click", () => {
    openMobileLead("sanjay");
    showMobileToast("Lead opened · assignment synced to manager");
  });
  window.salesRealtime?.publish("assignment.accepted", {
    leadId: "sanjay",
    leadName: "Sanjay Verma",
    owner: "Ravi Teja",
  });
  showMobileToast("Accepted · first-touch countdown started");
}

function declineAssignment() {
  window.clearInterval(assignmentTimer);
  const assignment = document.getElementById("incomingAssignment");
  assignment.classList.add("assignment-expired");
  assignment.innerHTML =
    "<div class=\"incoming-head\"><strong>Lead returned to routing</strong><b>Reassigning</b></div>" +
    "<p>Capacity marked unavailable for 15 minutes. The manager can see the handoff.</p>";
  window.salesRealtime?.publish("assignment.rejected", {
    leadId: "sanjay",
    leadName: "Sanjay Verma",
    owner: "Ravi Teja",
    reason: "Unavailable",
  });
  showMobileToast("Lead safely returned · no SLA time lost");
}

function bindAssignmentActions() {
  document.getElementById("acceptAssignment")?.addEventListener("click", acceptAssignment);
  document.getElementById("declineAssignment")?.addEventListener("click", declineAssignment);
}

bindAssignmentActions();

window.salesRealtime?.subscribe((event) => {
  if (event.type !== "lead.assigned") return;
  const assignment = document.getElementById("incomingAssignment");
  assignment.className = "incoming-assignment";
  assignment.innerHTML =
    '<div class="incoming-head"><span class="assignment-pulse"></span><strong>New website enquiry</strong><b id="acceptCountdown">01:30</b></div>' +
    "<h3>Sanjay Verma · Jubilee Hills</h3>" +
    "<p>₹9,200 monthly bill · Residential rooftop · High intent</p>" +
    '<div class="incoming-actions"><button class="btn btn-secondary" id="declineAssignment" type="button">Unavailable</button>' +
    '<button class="btn btn-primary" id="acceptAssignment" type="button">Accept lead</button></div>';
  bindAssignmentActions();
  startAssignmentTimer(event.payload.acceptBySeconds);
  showScreen("today");
  showMobileToast("New lead received from live workspace stream");
});

document.getElementById("visitActionButton").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const checkedIn = button.classList.toggle("visit-active");
  button.innerHTML = `${mobileIcon(checkedIn ? "check" : "location")}${checkedIn ? "Checked in" : "Visit"}`;
  showMobileToast(
    checkedIn
      ? "Survey started · timestamp shared with manager"
      : "Survey check-in cancelled",
  );
  if (checkedIn) {
    const lead = Object.values(mobileLeads).find((item) => item.phone === activePhone);
    window.salesRealtime?.publish("survey.started", {
      leadName: lead?.name || "Selected lead",
      owner: "Ravi Teja",
    });
  }
});

function filterMobileLeads() {
  const query = document.getElementById("mobileLeadSearch").value.trim().toLowerCase();
  document.querySelectorAll("#mobileLeadList [data-mobile-stage]").forEach((card) => {
    const matchesText = !query || card.dataset.mobileName.includes(query);
    const matchesStage =
      activeStageTab === "all" || card.dataset.mobileStage === activeStageTab;
    card.style.display = matchesText && matchesStage ? "block" : "none";
  });
}

document.getElementById("mobileLeadSearch").addEventListener("input", filterMobileLeads);
document.querySelectorAll("[data-stage-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeStageTab = tab.dataset.stageTab;
    document.querySelectorAll("[data-stage-tab]").forEach((item) => {
      item.classList.toggle("active", item === tab);
    });
    filterMobileLeads();
  });
});

const knownPhones = {
  "9876543210": "Ananya Reddy · Referral lead",
  "9848011672": "Vikram Kumar · Quotation lead",
  "9963088442": "Meera Iyer · Qualified lead",
};

const dialPhone = document.getElementById("dialPhone");
const startCallButton = document.getElementById("startCallButton");
const phoneMatch = document.getElementById("phoneMatch");

function normalizeDialValue() {
  const digits = dialPhone.value.replace(/\D/g, "").slice(-10);
  const groups = [digits.slice(0, 5), digits.slice(5)].filter(Boolean);
  dialPhone.value = groups.join(" ");
  const isValid = digits.length === 10;
  startCallButton.disabled = !isValid;

  if (!isValid) {
    phoneMatch.innerHTML = `<span class="avatar blue">?</span><div><strong>Enter a 10-digit mobile number</strong><p>Phone is the lead key within this workspace.</p></div>`;
    startCallButton.innerHTML = `${mobileIcon("phone")}Create lead and call`;
    return;
  }

  if (knownPhones[digits]) {
    phoneMatch.innerHTML = `<span class="avatar">✓</span><div><strong>Existing lead found</strong><p>${knownPhones[digits]}. The call will append to its timeline.</p></div>`;
    startCallButton.innerHTML = `${mobileIcon("phone")}Open lead and call`;
  } else {
    phoneMatch.innerHTML = `<span class="avatar amber">N</span><div><strong>New number in this workspace</strong><p>A minimal lead and Call Initiated activity will be created first.</p></div>`;
    startCallButton.innerHTML = `${mobileIcon("phone")}Create lead and call`;
  }
}

dialPhone.addEventListener("input", normalizeDialValue);

function openOutcomeSheet(phone) {
  activePhone = phone;
  document.getElementById("outcomePhone").textContent =
    `New lead · ${phone} · simulated 01:42`;
  outcomeSheet.classList.add("open");
  sheetOverlay.classList.add("open");
  outcomeSheet.setAttribute("aria-hidden", "false");
}

function closeOutcomeSheet() {
  outcomeSheet.classList.remove("open");
  sheetOverlay.classList.remove("open");
  outcomeSheet.setAttribute("aria-hidden", "true");
}

startCallButton.addEventListener("click", () => {
  const digits = dialPhone.value.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return;
  const phone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  const existing = Boolean(knownPhones[digits]);
  const persistenceMessage = isOffline
    ? `${existing ? "Call activity" : "New lead"} queued securely offline`
    : `${existing ? "Existing lead found" : "Lead created"} before dialer launch`;

  showMobileToast(persistenceMessage);
  startCallButton.disabled = true;
  startCallButton.textContent = "Simulating call…";
  window.setTimeout(() => {
    startCallButton.disabled = false;
    startCallButton.innerHTML = `${mobileIcon("phone")}${existing ? "Open lead and call" : "Create lead and call"}`;
    openOutcomeSheet(phone);
  }, 850);
});

document.getElementById("detailCallButton").addEventListener("click", () => {
  showMobileToast(isOffline ? "Call activity queued offline" : "Call activity created");
  window.setTimeout(() => openOutcomeSheet(activePhone), 650);
});

document.querySelectorAll("[data-outcome]").forEach((option) => {
  option.addEventListener("click", () => {
    selectedOutcome = option.dataset.outcome;
    document.querySelectorAll("[data-outcome]").forEach((item) => {
      item.classList.toggle("selected", item === option);
    });
    const stageMap = {
      "Connected · qualified": "Qualified",
      "Connected · follow up": "Contact attempted",
      "No answer": "Contact attempted",
      "Not interested": "Lost",
    };
    document.getElementById("outcomeStage").value = stageMap[selectedOutcome];
    const evidence = document.getElementById("outcomeEvidence");
    evidence.style.display = selectedOutcome.startsWith("Connected") ? "block" : "none";
    const nextAction = document.getElementById("outcomeNext");
    if (selectedOutcome === "No answer") {
      nextAction.value = "Retry call · Today, 5:30 PM";
    } else if (selectedOutcome === "Not interested") {
      nextAction.value = "Close lost · Customer not interested";
    } else if (selectedOutcome === "Connected · qualified") {
      nextAction.value = "Site survey · Tomorrow, 11:00 AM · customer confirmed";
    }
  });
});

document.getElementById("cancelOutcome").addEventListener("click", closeOutcomeSheet);
sheetOverlay.addEventListener("click", closeOutcomeSheet);

document.getElementById("saveOutcome").addEventListener("click", () => {
  const nextAction = document.getElementById("outcomeNext").value.trim();
  if (!nextAction) {
    showMobileToast("Add a dated next action or terminal reason");
    document.getElementById("outcomeNext").focus();
    return;
  }
  const activeLead = Object.values(mobileLeads).find((lead) => lead.phone === activePhone);
  closeOutcomeSheet();
  dialPhone.value = "";
  normalizeDialValue();
  if (isOffline) {
    document.getElementById("pendingSyncText").textContent = "2 actions queued";
    const badge = document.getElementById("syncBadge");
    badge.textContent = "Pending";
    badge.className = "badge badge-warning";
    showMobileToast(`${selectedOutcome} queued with next action`);
  } else {
    showMobileToast(`${selectedOutcome} · ${nextAction}`);
  }
  window.salesRealtime?.publish("contact.outcome", {
    leadName: activeLead?.name || activePhone || "New outbound lead",
    outcome: selectedOutcome,
    nextAction,
    owner: "Ravi Teja",
  });
  showScreen("today");
});

const offlineToggle = document.getElementById("offlineToggle");
offlineToggle.addEventListener("click", () => {
  isOffline = !isOffline;
  offlineToggle.classList.toggle("on", isOffline);
  phoneShell.classList.toggle("offline", isOffline);
  if (isOffline) {
    showMobileToast("Offline mode enabled");
  } else {
    const pendingText = document.getElementById("pendingSyncText");
    if (pendingText.textContent !== "No queued actions") {
      pendingText.textContent = "Syncing queued actions…";
      showMobileToast("Connection restored · syncing");
      window.setTimeout(() => {
        pendingText.textContent = "No queued actions";
        const badge = document.getElementById("syncBadge");
        badge.textContent = "Synced";
        badge.className = "badge badge-success";
        showMobileToast("2 queued actions synchronized");
      }, 1200);
    } else {
      showMobileToast("Online mode restored");
    }
  }
});

document.querySelectorAll("[data-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("on");
    showMobileToast(toggle.classList.contains("on") ? "Reminder enabled" : "Reminder disabled");
  });
});
