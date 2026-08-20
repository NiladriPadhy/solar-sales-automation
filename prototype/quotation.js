const quotationCatalogue = {
  pvModule550: {
    name: "N-type TOPCon bifacial PV module",
    specification: "550 Wp; ALMM-listed model; minimum 12-year product and 25-year performance warranty",
    hsn: "85414300",
    unit: "No.",
    rate: 14850,
    gst: 12,
  },
  inverter3kw: {
    name: "On-grid string inverter",
    specification: "3 kW, single phase, dual MPPT, anti-islanding protection and Wi-Fi monitoring",
    hsn: "85044090",
    unit: "No.",
    rate: 42500,
    gst: 12,
  },
  mountingStructure: {
    name: "Module mounting structure",
    specification: "Hot-dip galvanized GI fixed-tilt structure designed for the surveyed roof and local wind load",
    hsn: "73089090",
    unit: "kWp",
    rate: 10500,
    gst: 18,
  },
  dcCable: {
    name: "Solar DC cable",
    specification: "1.5 kV, 4 sq. mm, UV-resistant, flame-retardant copper cable",
    hsn: "85444999",
    unit: "m",
    rate: 135,
    gst: 18,
  },
  acCable: {
    name: "AC power cable",
    specification: "Copper conductor cable sized for inverter output and surveyed route",
    hsn: "85444999",
    unit: "m",
    rate: 210,
    gst: 18,
  },
  dcdb: {
    name: "DC distribution box",
    specification: "String protection with DC isolator, fuses and Type II surge protection device",
    hsn: "85371000",
    unit: "Set",
    rate: 9500,
    gst: 18,
  },
  acdb: {
    name: "AC distribution box",
    specification: "MCB/MCCB, isolator and Type II AC surge protection sized for the proposed plant",
    hsn: "85371000",
    unit: "Set",
    rate: 8500,
    gst: 18,
  },
  earthing: {
    name: "Copper-bonded earthing system",
    specification: "Electrode, earth-enhancement compound, chamber and connection strip",
    hsn: "85369090",
    unit: "No.",
    rate: 6500,
    gst: 18,
  },
  lightningArrestor: {
    name: "Lightning protection system",
    specification: "Lightning arrester with dedicated earth termination and mounting accessories",
    hsn: "85354000",
    unit: "Set",
    rate: 7500,
    gst: 18,
  },
  installation: {
    name: "Installation, testing and commissioning",
    specification: "Mechanical and electrical installation, testing, commissioning and customer handover",
    hsn: "9954",
    unit: "kWp",
    rate: 16000,
    gst: 18,
  },
  netMetering: {
    name: "Net-metering application coordination",
    specification: "Document preparation, application tracking and DISCOM coordination; statutory charges excluded",
    hsn: "9983",
    unit: "Job",
    rate: 8000,
    gst: 18,
  },
};

const quotationLeads = {
  meera: {
    name: "Meera Iyer",
    phone: "+91 99630 88442",
    address: "Gachibowli, Hyderabad, Telangana",
    pincode: "500032",
    capacity: 3.3,
    sanctionedLoad: 5,
    annualGeneration: 4950,
  },
  rohan: {
    name: "Rohan Patel",
    phone: "+91 98490 12678",
    address: "Miyapur, Hyderabad, Telangana",
    pincode: "500049",
    capacity: 4.4,
    sanctionedLoad: 7,
    annualGeneration: 6600,
  },
  karthik: {
    name: "Karthik Rao",
    phone: "+91 93982 77201",
    address: "Kondapur, Hyderabad, Telangana",
    pincode: "500084",
    capacity: 5.5,
    sanctionedLoad: 8,
    annualGeneration: 8250,
  },
  ananya: {
    name: "Ananya Reddy",
    phone: "+91 98765 43210",
    address: "Hyderabad, Telangana",
    pincode: "500001",
    capacity: 3.3,
    sanctionedLoad: 5,
    annualGeneration: 4950,
  },
};

let quotationItemSequence = 20;
const quotationState = {
  status: "Draft",
  revision: 1,
  leadId: "meera",
  items: [
    { id: 1, catalogueId: "pvModule550", quantity: 6, rate: 14850 },
    { id: 2, catalogueId: "inverter3kw", quantity: 1, rate: 42500 },
    { id: 3, catalogueId: "mountingStructure", quantity: 3.3, rate: 10500 },
    { id: 4, catalogueId: "dcCable", quantity: 60, rate: 135 },
    { id: 5, catalogueId: "acCable", quantity: 25, rate: 210 },
    { id: 6, catalogueId: "dcdb", quantity: 1, rate: 9500 },
    { id: 7, catalogueId: "acdb", quantity: 1, rate: 8500 },
    { id: 8, catalogueId: "earthing", quantity: 3, rate: 6500 },
    { id: 9, catalogueId: "lightningArrestor", quantity: 1, rate: 7500 },
    { id: 10, catalogueId: "installation", quantity: 3.3, rate: 16000 },
    { id: 11, catalogueId: "netMetering", quantity: 1, rate: 8000 },
  ],
  overriddenItemIds: new Set(),
};

const quotationFieldIds = [
  "quoteCustomerGstin",
  "quoteSitePincode",
  "quoteSiteAddress",
  "quoteSystemCapacity",
  "quoteSystemType",
  "quoteConnectionPhase",
  "quoteDiscom",
  "quoteSanctionedLoad",
  "quoteAnnualGeneration",
  "quoteSellerName",
  "quoteSellerGstin",
  "quoteSellerAddress",
  "quoteSellerEmail",
  "quoteSellerPhone",
  "quoteNumber",
  "quoteDate",
  "quoteValidUntil",
  "quotePlaceOfSupply",
  "quoteTaxMode",
  "quoteBankName",
  "quoteBankAccount",
  "quoteBankIfsc",
  "quoteDiscount",
  "quoteSubsidy",
  "quoteScope",
  "quoteExclusions",
  "quotePaymentTerms",
  "quoteWarrantyTerms",
  "quoteDeliveryTimeline",
];

function quoteField(id) {
  return document.getElementById(id);
}

function quoteEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function quoteCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function quoteDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function quoteLines(value) {
  return quoteEscape(value)
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${line}</li>`)
    .join("");
}

function calculateQuotation() {
  const rows = quotationState.items.map((item) => {
    const catalogue = quotationCatalogue[item.catalogueId];
    const amount = item.quantity * item.rate;
    return { ...item, catalogue, amount };
  });
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
  const discount = Math.min(Math.max(Number(quoteField("quoteDiscount").value) || 0, 0), subtotal);
  const discountRatio = subtotal ? discount / subtotal : 0;
  const taxable = subtotal - discount;
  const tax = rows.reduce(
    (sum, row) => sum + row.amount * (1 - discountRatio) * (row.catalogue.gst / 100),
    0,
  );
  const total = taxable + tax;
  const subsidy = Math.max(Number(quoteField("quoteSubsidy").value) || 0, 0);
  return { rows, subtotal, discount, taxable, tax, total, subsidy, effectiveCost: Math.max(0, total - subsidy) };
}

function catalogueOptions(selectedId) {
  return Object.entries(quotationCatalogue)
    .map(
      ([id, item]) =>
        `<option value="${id}" ${id === selectedId ? "selected" : ""}>${quoteEscape(item.name)}</option>`,
    )
    .join("");
}

function renderQuotationItems() {
  const body = quoteField("quoteItemsBody");
  body.innerHTML = quotationState.items
    .map((item) => {
      const catalogue = quotationCatalogue[item.catalogueId];
      return `<tr data-quote-item="${item.id}">
        <td>
          <select class="quote-item-select" aria-label="Catalogue item">${catalogueOptions(item.catalogueId)}</select>
          <small>${quoteEscape(catalogue.specification)}</small>
        </td>
        <td><code>${quoteEscape(catalogue.hsn)}</code></td>
        <td><input class="quote-item-quantity" type="number" min="0.01" step="0.01" value="${item.quantity}" /></td>
        <td>${quoteEscape(catalogue.unit)}</td>
        <td><input class="quote-item-rate" type="number" min="0" step="0.01" value="${item.rate}" /></td>
        <td>${catalogue.gst}%</td>
        <td class="quote-line-total">${quoteCurrency(item.quantity * item.rate)}</td>
        <td><button class="quote-remove-item" type="button" aria-label="Remove ${quoteEscape(catalogue.name)}">×</button></td>
      </tr>`;
    })
    .join("");

  body.querySelectorAll("tr").forEach((row) => {
    const id = Number(row.dataset.quoteItem);
    const item = quotationState.items.find((candidate) => candidate.id === id);
    row.querySelector(".quote-item-select").addEventListener("change", (event) => {
      item.catalogueId = event.currentTarget.value;
      item.rate = quotationCatalogue[item.catalogueId].rate;
      quotationState.overriddenItemIds.delete(id);
      markQuotationChanged();
      renderQuotationItems();
      renderQuotationPreview();
    });
    row.querySelector(".quote-item-quantity").addEventListener("input", (event) => {
      item.quantity = Math.max(Number(event.currentTarget.value) || 0, 0);
      row.querySelector(".quote-line-total").textContent = quoteCurrency(item.quantity * item.rate);
      markQuotationChanged();
      renderQuotationPreview();
    });
    row.querySelector(".quote-item-rate").addEventListener("input", (event) => {
      item.rate = Math.max(Number(event.currentTarget.value) || 0, 0);
      const mappedRate = quotationCatalogue[item.catalogueId].rate;
      if (item.rate !== mappedRate) quotationState.overriddenItemIds.add(id);
      else quotationState.overriddenItemIds.delete(id);
      row.querySelector(".quote-line-total").textContent = quoteCurrency(item.quantity * item.rate);
      markQuotationChanged();
      renderQuotationPreview();
    });
    row.querySelector(".quote-item-rate").addEventListener("change", () => {
      if (quotationState.overriddenItemIds.has(id)) {
        appendQuotationEvent(
          "CATALOGUE_PRICE_OVERRIDDEN",
          `${quotationCatalogue[item.catalogueId].name}: ${quoteCurrency(quotationCatalogue[item.catalogueId].rate)} → ${quoteCurrency(item.rate)}`,
        );
      }
    });
    row.querySelector(".quote-remove-item").addEventListener("click", () => {
      quotationState.items = quotationState.items.filter((candidate) => candidate.id !== id);
      quotationState.overriddenItemIds.delete(id);
      markQuotationChanged();
      appendQuotationEvent("QUOTATION_ITEM_REMOVED", quotationCatalogue[item.catalogueId].name);
      renderQuotationItems();
      renderQuotationPreview();
    });
  });
}

function renderQuotationPreview() {
  const lead = quotationLeads[quotationState.leadId];
  const totals = calculateQuotation();
  const taxMode = quoteField("quoteTaxMode").value;
  const sellerGstin = quoteField("quoteSellerGstin").value.trim().toUpperCase();
  const customerGstin = quoteField("quoteCustomerGstin").value.trim().toUpperCase();
  const contact = [quoteField("quoteSellerEmail").value, quoteField("quoteSellerPhone").value]
    .filter(Boolean)
    .join(" · ");
  const bankDetails = [
    quoteField("quoteBankName").value,
    quoteField("quoteBankAccount").value && `A/c ${quoteField("quoteBankAccount").value}`,
    quoteField("quoteBankIfsc").value && `IFSC ${quoteField("quoteBankIfsc").value.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const itemRows = totals.rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td><strong>${quoteEscape(row.catalogue.name)}</strong><span>${quoteEscape(row.catalogue.specification)}</span></td>
        <td>${quoteEscape(row.catalogue.hsn)}</td>
        <td>${row.quantity} ${quoteEscape(row.catalogue.unit)}</td>
        <td>${quoteCurrency(row.rate)}</td>
        <td>${row.catalogue.gst}%</td>
        <td>${quoteCurrency(row.amount)}</td>
      </tr>`,
    )
    .join("");

  const taxRows =
    taxMode === "intra"
      ? `<div><span>CGST</span><strong>${quoteCurrency(totals.tax / 2)}</strong></div>
         <div><span>SGST</span><strong>${quoteCurrency(totals.tax / 2)}</strong></div>`
      : `<div><span>IGST</span><strong>${quoteCurrency(totals.tax)}</strong></div>`;

  quoteField("quotationPreview").innerHTML = `
    <header class="quote-doc-header">
      <div class="quote-doc-brand"><span>S</span><div><h2>${quoteEscape(quoteField("quoteSellerName").value)}</h2><p>${quoteEscape(quoteField("quoteSellerAddress").value)}</p>${contact ? `<p>${quoteEscape(contact)}</p>` : ""}</div></div>
      <div class="quote-doc-title"><span>QUOTATION</span><strong>${quoteEscape(quoteField("quoteNumber").value)}</strong><small>Revision ${String(quotationState.revision).padStart(2, "0")}</small></div>
    </header>
    <div class="quote-doc-meta">
      <div><span>Quotation date</span><strong>${quoteDate(quoteField("quoteDate").value)}</strong></div>
      <div><span>Valid until</span><strong>${quoteDate(quoteField("quoteValidUntil").value)}</strong></div>
      <div><span>Seller GSTIN</span><strong class="${sellerGstin ? "" : "quote-required"}">${quoteEscape(sellerGstin || "Required before approval")}</strong></div>
      <div><span>Place of supply</span><strong>${quoteEscape(quoteField("quotePlaceOfSupply").value)}</strong></div>
    </div>
    <section class="quote-doc-party">
      <div><span>Quotation for</span><h3>${quoteEscape(lead.name)}</h3><p>${quoteEscape(lead.phone)}</p><p>${quoteEscape(quoteField("quoteSiteAddress").value)} · ${quoteEscape(quoteField("quoteSitePincode").value)}</p>${customerGstin ? `<p>GSTIN: ${quoteEscape(customerGstin)}</p>` : ""}</div>
      <div><span>Proposed system</span><h3>${quoteEscape(quoteField("quoteSystemCapacity").value)} kWp ${quoteEscape(quoteField("quoteSystemType").value)}</h3><p>${quoteEscape(quoteField("quoteConnectionPhase").value)} · ${quoteEscape(quoteField("quoteDiscom").value)}</p><p>Estimated generation: ${Number(quoteField("quoteAnnualGeneration").value).toLocaleString("en-IN")} kWh/year</p></div>
    </section>
    <table class="quote-doc-items">
      <thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>GST</th><th>Amount</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="quote-doc-commercial">
      <div class="quote-doc-note"><strong>Commercial note</strong><p>Rates are linked to the selected catalogue and remain subject to this quotation's validity. Statutory taxes apply as shown.</p></div>
      <div class="quote-doc-totals">
        <div><span>Subtotal</span><strong>${quoteCurrency(totals.subtotal)}</strong></div>
        ${totals.discount ? `<div><span>Commercial discount</span><strong>− ${quoteCurrency(totals.discount)}</strong></div>` : ""}
        <div><span>Taxable value</span><strong>${quoteCurrency(totals.taxable)}</strong></div>
        ${taxRows}
        <div class="grand-total"><span>Total quotation value</span><strong>${quoteCurrency(totals.total)}</strong></div>
        ${totals.subsidy ? `<div><span>Expected subsidy*</span><strong>− ${quoteCurrency(totals.subsidy)}</strong></div><div class="effective-total"><span>Estimated net customer cost*</span><strong>${quoteCurrency(totals.effectiveCost)}</strong></div>` : ""}
      </div>
    </div>
    ${totals.subsidy ? '<p class="quote-subsidy-note">*Subsidy is indicative and subject to customer, system, vendor, DISCOM, and government-scheme eligibility. It is normally disbursed by the competent authority and is not a discount from the seller.</p>' : ""}
    <section class="quote-doc-terms">
      <div><h4>Included scope</h4><ul>${quoteLines(quoteField("quoteScope").value)}</ul></div>
      <div><h4>Exclusions</h4><ul>${quoteLines(quoteField("quoteExclusions").value)}</ul></div>
      <div><h4>Payment milestones</h4><ul>${quoteLines(quoteField("quotePaymentTerms").value)}</ul></div>
      <div><h4>Warranty</h4><ul>${quoteLines(quoteField("quoteWarrantyTerms").value)}</ul></div>
    </section>
    <section class="quote-doc-delivery"><strong>Execution timeline</strong><p>${quoteEscape(quoteField("quoteDeliveryTimeline").value)}</p></section>
    ${bankDetails ? `<section class="quote-doc-bank"><strong>Payment details</strong><p>${quoteEscape(bankDetails)}</p></section>` : ""}
    <footer class="quote-doc-footer">
      <div><span>Customer acceptance</span><i>Name, signature and date</i></div>
      <div><span>For ${quoteEscape(quoteField("quoteSellerName").value)}</span><i>Authorized signatory</i></div>
    </footer>`;

  quoteField("previewVersionLabel").textContent =
    `${quotationState.status} · revision ${String(quotationState.revision).padStart(2, "0")}`;
}

function updateQuotationStatus() {
  const badge = quoteField("quoteStatusBadge");
  badge.textContent = `${quotationState.status} · v${quotationState.revision}`;
  badge.className =
    quotationState.status === "Approved"
      ? "badge badge-success"
      : quotationState.status === "Shared"
        ? "badge badge-contacted"
        : "badge badge-neutral";
}

function markQuotationChanged() {
  if (quotationState.status === "Approved" || quotationState.status === "Shared") {
    const previousRevision = quotationState.revision;
    quotationState.revision += 1;
    quotationState.status = "Draft";
    quoteField("quoteRevision").value = String(quotationState.revision).padStart(2, "0");
    updateQuotationStatus();
    appendQuotationEvent(
      "QUOTATION_REVISION_CREATED",
      `Revision ${quotationState.revision} created before modifying locked revision ${previousRevision}`,
    );
  }
}

function appendQuotationEvent(type, description) {
  const eventId = `qevt_${Math.random().toString(16).slice(2, 8)}`;
  const item = document.createElement("div");
  item.className = "feed-item event-new";
  item.innerHTML = `<strong>${quoteEscape(type)} · v${quotationState.revision}</strong>${quoteEscape(description)}<time>just now · ${eventId}</time>`;
  quoteField("quotationEventFeed").prepend(item);
}

function validateQuotationForApproval() {
  const gstin = quoteField("quoteSellerGstin").value.trim().toUpperCase();
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if (!gstinPattern.test(gstin)) return "Enter a valid seller GSTIN before approval";
  if (!quoteField("quoteSellerEmail").value.trim() && !quoteField("quoteSellerPhone").value.trim()) {
    return "Enter a seller email or phone number";
  }
  if (!quoteField("quoteSiteAddress").value.trim() || quoteField("quoteSitePincode").value.trim().length !== 6) {
    return "Enter the complete installation site and six-digit PIN code";
  }
  if (!quotationState.items.length) return "Add at least one quotation item";
  if (quotationState.overriddenItemIds.size && !quoteField("quotePriceOverrideReason").value.trim()) {
    return "Explain why the mapped catalogue price was changed";
  }
  if (!quoteField("quoteValidUntil").value) return "Set the quotation validity date";
  return "";
}

function loadQuotationLead(leadId) {
  const lead = quotationLeads[leadId];
  if (!lead) return;
  quotationState.leadId = leadId;
  quoteField("quoteLeadSelect").value = leadId;
  quoteField("quoteSiteAddress").value = lead.address;
  quoteField("quoteSitePincode").value = lead.pincode;
  quoteField("quoteSystemCapacity").value = lead.capacity;
  quoteField("quoteSanctionedLoad").value = lead.sanctionedLoad;
  quoteField("quoteAnnualGeneration").value = lead.annualGeneration;
  appendQuotationEvent("QUOTATION_LEAD_CHANGED", `Quotation linked to ${lead.name}`);
  markQuotationChanged();
  renderQuotationPreview();
}

quoteField("quoteLeadSelect").addEventListener("change", (event) => loadQuotationLead(event.currentTarget.value));

quotationFieldIds.forEach((id) => {
  const field = quoteField(id);
  field.addEventListener("input", () => {
    markQuotationChanged();
    renderQuotationPreview();
  });
  field.addEventListener("change", () => {
    markQuotationChanged();
    renderQuotationPreview();
  });
});

quoteField("addQuoteItemButton").addEventListener("click", () => {
  const catalogueId = "pvModule550";
  quotationState.items.push({
    id: ++quotationItemSequence,
    catalogueId,
    quantity: 1,
    rate: quotationCatalogue[catalogueId].rate,
  });
  markQuotationChanged();
  appendQuotationEvent("QUOTATION_ITEM_ADDED", quotationCatalogue[catalogueId].name);
  renderQuotationItems();
  renderQuotationPreview();
});

quoteField("saveQuotationButton").addEventListener("click", () => {
  appendQuotationEvent("QUOTATION_DRAFT_SAVED", "Current HTML, item, tax, and commercial terms snapshot saved");
  showToast(`Quotation ${quoteField("quoteNumber").value} draft saved`);
});

quoteField("approveQuotationButton").addEventListener("click", () => {
  const validationError = validateQuotationForApproval();
  if (validationError) {
    showToast(validationError, 4200);
    return;
  }
  quotationState.status = "Approved";
  updateQuotationStatus();
  renderQuotationPreview();
  appendQuotationEvent("QUOTATION_APPROVED", "Current revision locked for customer sharing");
  prependLiveEvent(
    `QUOTATION_APPROVED · ${quotationLeads[quotationState.leadId].name}`,
    `${quoteField("quoteNumber").value} v${quotationState.revision} approved at ${quoteCurrency(calculateQuotation().total)}.`,
    "qevt_live",
  );
  window.salesRealtime?.publish("quotation.approved", {
    leadName: quotationLeads[quotationState.leadId].name,
    quotationNumber: quoteField("quoteNumber").value,
    revision: quotationState.revision,
    total: calculateQuotation().total,
  });
  showToast("Quotation approved · ready to share");
});

quoteField("createRevisionButton").addEventListener("click", () => {
  quotationState.revision += 1;
  quotationState.status = "Draft";
  quoteField("quoteRevision").value = String(quotationState.revision).padStart(2, "0");
  updateQuotationStatus();
  appendQuotationEvent("QUOTATION_REVISION_CREATED", `Revision ${quotationState.revision} copied from the previous version`);
  renderQuotationPreview();
  showToast(`Revision ${quotationState.revision} created`);
});

quoteField("shareQuotationButton").addEventListener("click", () => {
  if (quotationState.status !== "Approved") {
    showToast("Approve the current quotation version before sharing", 3600);
    return;
  }
  const lead = quotationLeads[quotationState.leadId];
  appendQuotationEvent("WHATSAPP_SHARE_REQUESTED", `Approved PDF requested for ${lead.phone}`);
  showToast("Preparing approved quotation for WhatsApp Business…");
  window.setTimeout(() => {
    quotationState.status = "Shared";
    updateQuotationStatus();
    renderQuotationPreview();
    appendQuotationEvent("WHATSAPP_DOCUMENT_SENT", `Quotation sent to ${lead.name}; delivery tracking started`);
    prependLiveEvent(
      `QUOTATION_WHATSAPP_SENT · ${lead.name}`,
      `${quoteField("quoteNumber").value} v${quotationState.revision} sent; delivery receipt pending.`,
      "qevt_wa",
    );
    window.salesRealtime?.publish("quotation.shared", {
      leadName: lead.name,
      phone: lead.phone,
      quotationNumber: quoteField("quoteNumber").value,
      revision: quotationState.revision,
      total: calculateQuotation().total,
    });
    showToast("Quotation shared · WhatsApp message ID recorded");
    window.setTimeout(() => {
      appendQuotationEvent("WHATSAPP_DOCUMENT_DELIVERED", `WhatsApp delivery receipt received for ${lead.phone}`);
    }, 700);
    window.setTimeout(() => {
      appendQuotationEvent("WHATSAPP_DOCUMENT_READ", `${lead.name} opened the WhatsApp document message`);
      prependLiveEvent(
        `QUOTATION_VIEWED · ${lead.name}`,
        `${quoteField("quoteNumber").value} v${quotationState.revision} was opened from WhatsApp.`,
        "qevt_read",
      );
    }, 1600);
  }, 900);
});

quoteField("printPreviewButton").addEventListener("click", () => {
  appendQuotationEvent("QUOTATION_PRINT_REQUESTED", "Browser print/PDF preview opened for the current HTML version");
  window.print();
});

quoteField("drawerQuoteButton").addEventListener("click", () => {
  const leadId = document.getElementById("leadDrawer").dataset.leadId;
  closeLeadDrawer();
  activateView("quotations");
  if (quotationLeads[leadId]) loadQuotationLead(leadId);
  showToast(`Quotation workspace opened for ${quotationLeads[leadId]?.name || "selected lead"}`);
});

renderQuotationItems();
renderQuotationPreview();
updateQuotationStatus();
