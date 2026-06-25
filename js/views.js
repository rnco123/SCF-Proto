const Views = {
  landingEntityPill(entity, role) {
    return `
      <button type="button" class="entity-pill" data-action="enter-as" data-role="${role}" data-entity-id="${entity.id}">
        <span class="entity-pill-id">${entity.id}</span>
        <span class="entity-pill-name">${entity.companyName}</span>
        <span class="entity-pill-meta">${entity.pocName} · ${entity.designation}</span>
      </button>
    `;
  },

  /* ── Landing ─────────────────────────────────────────────────── */
  landing() {
    const { suppliers, buyers, banks } = getAllDemoEntities();
    const programs = getData()?.programs || [];

    return `
      <div class="landing">
        <header class="landing-header">
          <a href="#/" class="landing-logo">
            <img src="assets/logo.png" alt="TradeOrigin">
          </a>
          <span class="landing-header-meta">Supply Chain Finance · Prototype</span>
        </header>
        <section class="landing-hero">
          <div class="landing-eyebrow">SCF Platform — Prototype v0.1</div>
          <h1>Supply Chain Finance for the Modern Trade</h1>
          <p>Connect suppliers, buyers, and funders in a single workflow — from invoice approval to early payment disbursement.</p>

          <div class="role-cards">
            <div class="role-card">
              <div class="role-card-icon">${icon('truck')}</div>
              <h3>Supplier</h3>
              <p>Submit invoices, request early payment, and track funding status across buyer programs.</p>
              <div class="entity-pill-list">
                ${suppliers.map((e) => Views.landingEntityPill(e, 'supplier')).join('')}
              </div>
              <span class="role-count">${suppliers.length} suppliers</span>
            </div>

            <div class="role-card">
              <div class="role-card-icon">${icon('building')}</div>
              <h3>Buyer</h3>
              <p>Approve supplier invoices, manage payables programs, and strengthen your supply chain.</p>
              <div class="entity-pill-list">
                ${buyers.map((e) => Views.landingEntityPill(e, 'buyer')).join('')}
              </div>
              <span class="role-count">${buyers.length} buyer</span>
            </div>

            <div class="role-card">
              <div class="role-card-icon">${icon('landmark')}</div>
              <h3>Funder</h3>
              <p>Review funding opportunities, deploy capital, and monitor portfolio performance.</p>
              <div class="entity-pill-list">
                ${banks.map((e) => Views.landingEntityPill(e, 'funder')).join('')}
              </div>
              <span class="role-count">${banks.length} banks</span>
            </div>
          </div>

          <div class="landing-registry card mt-6">
            <div class="card-header">
              <h3>Demo Registry — All Parties</h3>
              <span class="text-xs text-secondary">${suppliers.length + buyers.length + banks.length} entities · Pakistan</span>
            </div>
            <div class="table-wrap">
              <table class="data-table landing-registry-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Company</th>
                    <th>POC</th>
                    <th>Designation</th>
                    <th>Program</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${suppliers.map((e) => {
                    const enrolled = programs
                      .filter((p) => p.enrolledSupplierIds?.includes(e.id))
                      .map((p) => p.id)
                      .join(', ') || '—';
                    return `
                    <tr>
                      <td class="text-mono">${e.id}</td>
                      <td>Supplier</td>
                      <td class="font-medium">${e.companyName}</td>
                      <td>${e.pocName}</td>
                      <td class="text-secondary">${e.designation}</td>
                      <td class="text-mono text-xs">${enrolled}</td>
                      <td><button type="button" class="btn btn-ghost btn-sm" data-action="enter-as" data-role="supplier" data-entity-id="${e.id}">Enter →</button></td>
                    </tr>`;
                  }).join('')}
                  ${buyers.map((e) => {
                    const owned = programs.filter((p) => p.buyerId === e.id).map((p) => p.id).join(', ');
                    return `
                    <tr>
                      <td class="text-mono">${e.id}</td>
                      <td>Buyer</td>
                      <td class="font-medium">${e.companyName}</td>
                      <td>${e.pocName}</td>
                      <td class="text-secondary">${e.designation}</td>
                      <td class="text-mono text-xs">${owned}</td>
                      <td><button type="button" class="btn btn-ghost btn-sm" data-action="enter-as" data-role="buyer" data-entity-id="${e.id}">Enter →</button></td>
                    </tr>`;
                  }).join('')}
                  ${banks.map((e) => {
                    const enrolled = programs
                      .filter((p) => p.enrolledFunderIds?.includes(e.id))
                      .map((p) => p.id)
                      .join(', ') || '—';
                    return `
                    <tr>
                      <td class="text-mono">${e.id}</td>
                      <td>Bank</td>
                      <td class="font-medium">${e.companyName}</td>
                      <td>${e.pocName}</td>
                      <td class="text-secondary">${e.designation}</td>
                      <td class="text-mono text-xs">${enrolled}</td>
                      <td><button type="button" class="btn btn-ghost btn-sm" data-action="enter-as" data-role="funder" data-entity-id="${e.id}">Enter →</button></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <footer class="landing-footer">
          © 2026 TradeOrigin · Prototype — HTML / CSS / JS + JSON
        </footer>
      </div>
    `;
  },

  /* ── Supplier Views ──────────────────────────────────────────── */
  supplierDashboard() {
    const invoices = getInvoicesForRole('supplier');
    const stats = computeSupplierStats(invoices);
    const activities = getActivitiesForRole('supplier').slice(0, 5);
    const eligible = invoices.filter((i) => i.status === 'approved' && !i.fundingStatus);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Outstanding Receivables</div>
            <div class="stat-value">${formatCurrency(stats.totalOutstanding)}</div>
            <div class="stat-change">${invoices.filter(i => i.status !== 'paid').length} open invoices</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('zap')}</div>
          <div class="stat-text">
            <div class="stat-label">Available for Early Payment</div>
            <div class="stat-value">${formatCurrency(stats.totalAvailable)}</div>
            <div class="stat-change positive">${stats.availableCount} invoices eligible</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('trending-up')}</div>
          <div class="stat-text">
            <div class="stat-label">Total Funded (YTD)</div>
            <div class="stat-value">${formatCurrency(stats.totalFunded)}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile orange">${icon('inbox')}</div>
          <div class="stat-text">
            <div class="stat-label">Pending Approval</div>
            <div class="stat-value">${stats.pendingCount}</div>
            <div class="stat-change">awaiting buyer review</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>Recent Invoices</h3>
            <a href="#/supplier/invoices" class="btn btn-ghost btn-sm">View all</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.slice(0, 5).map((i) => invoiceTableRow(i)).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Activity</h3></div>
          <div class="card-body">
            <ul class="activity-feed">
              ${activities.map((a) => `
                <li class="activity-item">
                  <div class="activity-dot ${activityDot(a.type)}"></div>
                  <div class="activity-content">
                    <div class="activity-title">${a.title}</div>
                    <div class="activity-meta">${formatRelativeDate(a.timestamp)}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      ${eligible.length ? `
        <div class="card mt-6">
          <div class="card-header">
            <h3>Early Payment Available</h3>
            <a href="#/supplier/early-payment" class="btn btn-primary btn-sm">${icon('zap')} Request Payment</a>
          </div>
          <div class="card-body">
            ${eligible.map((inv) => `
              <div class="opportunity-card">
                <div class="opportunity-info">
                  <h4>${inv.invoiceNumber} — ${inv.description}</h4>
                  <div class="opportunity-meta">Due ${formatDate(inv.dueDate)} · Net proceeds ${formatCurrency(inv.discountOffer?.netProceeds || inv.amount)}</div>
                </div>
                <div class="opportunity-amount">
                  <div class="amount">${formatCurrency(inv.amount)}</div>
                  <div class="rate">${inv.discountOffer?.rate}% discount rate</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  supplierInvoices() {
    const invoices = getInvoicesForRole('supplier');
    return `
      <div class="filter-bar">
        <div class="filter-pills">
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="pending">Pending</button>
          <button class="filter-pill" data-filter="approved">Approved</button>
          <button class="filter-pill" data-filter="funded">Funded</button>
          <button class="filter-pill" data-filter="paid">Paid</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table class="data-table" id="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>PO #</th>
                <th>Amount</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map((i) => `
                <tr data-invoice-id="${i.id}" data-status="${i.status}">
                  <td class="text-mono">${i.invoiceNumber}</td>
                  <td class="text-mono">${i.poNumber}</td>
                  <td class="font-medium">${formatCurrency(i.amount)}</td>
                  <td>${formatDate(i.issueDate)}</td>
                  <td>${formatDate(i.dueDate)}</td>
                  <td>${statusBadge(i.status)}</td>
                  <td class="text-secondary">${i.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  supplierEarlyPayment() {
    const invoices = getInvoicesForRole('supplier').filter(
      (i) => i.status === 'approved' && !i.fundingStatus
    );

    if (!invoices.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('inbox')}
            <h3>No invoices eligible for early payment</h3>
            <p class="mt-2">Approved invoices will appear here with discount offers from your buyer's program.</p>
          </div>
        </div>
      `;
    }

    return `
      <p class="text-secondary mb-6">Select an approved invoice to request early payment. Discount rates are set by your buyer's SCF program.</p>
      ${invoices.map((inv) => `
        <div class="card mb-4" data-invoice-id="${inv.id}">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h4>${inv.invoiceNumber}</h4>
                <p class="text-sm text-secondary">${inv.description}</p>
              </div>
              ${statusBadge(inv.status)}
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Invoice Amount</label>
                <div class="value large">${formatCurrency(inv.amount)}</div>
              </div>
              <div class="detail-item">
                <label>Due Date</label>
                <div class="value">${formatDate(inv.dueDate)} (${daysUntil(inv.dueDate)} days)</div>
              </div>
              <div class="detail-item">
                <label>Discount Rate</label>
                <div class="value">${inv.discountOffer?.rate}% p.a.</div>
              </div>
              <div class="detail-item">
                <label>Discount Amount</label>
                <div class="value">−${formatCurrency(inv.discountOffer?.discountAmount)}</div>
              </div>
              <div class="detail-item">
                <label>Early Payment Date</label>
                <div class="value">${formatDate(inv.discountOffer?.earlyPaymentDate)}</div>
              </div>
              <div class="detail-item">
                <label>Net Proceeds</label>
                <div class="value large" style="color: var(--color-success)">${formatCurrency(inv.discountOffer?.netProceeds)}</div>
              </div>
            </div>
            <div class="mt-6">
              <button class="btn btn-primary" data-action="request-funding" data-invoice-id="${inv.id}">
                ${icon('zap')} Request Early Payment
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    `;
  },

  supplierPrograms() {
    const programs = getProgramsForRole('supplier');
    return Views.programsList(programs, 'supplier');
  },

  /* ── Buyer Views ─────────────────────────────────────────────── */
  buyerDashboard() {
    const invoices = getInvoicesForRole('buyer');
    const stats = computeBuyerStats(invoices);
    const pending = invoices.filter((i) => i.status === 'pending');
    const activities = getActivitiesForRole('buyer').slice(0, 5);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-tile orange">${icon('inbox')}</div>
          <div class="stat-text">
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-value">${stats.pendingCount}</div>
            <div class="stat-change">${formatCurrency(stats.pendingAmount)} total</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Outstanding Payables</div>
            <div class="stat-value">${formatCurrency(stats.totalPayables)}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('layers')}</div>
          <div class="stat-text">
            <div class="stat-label">Program Utilization</div>
            <div class="stat-value">${stats.programUtilization}%</div>
            <div class="stat-change">of total facility limit</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('users')}</div>
          <div class="stat-text">
            <div class="stat-label">Active Suppliers</div>
            <div class="stat-value">${stats.supplierCount}</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>Awaiting Your Approval</h3>
            <a href="#/buyer/approvals" class="btn btn-primary btn-sm">Review all</a>
          </div>
          ${pending.length ? `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  ${pending.map((i) => `
                    <tr data-invoice-id="${i.id}">
                      <td class="text-mono">${i.invoiceNumber}</td>
                      <td>${i.supplierName || getSupplierName(i.supplierId)}</td>
                      <td class="font-medium">${formatCurrency(i.amount)}</td>
                      <td>${formatDate(i.issueDate)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `<div class="empty-state"><p>All invoices reviewed — no pending approvals.</p></div>`}
        </div>

        <div class="card">
          <div class="card-header"><h3>Recent Activity</h3></div>
          <div class="card-body">
            <ul class="activity-feed">
              ${activities.map((a) => `
                <li class="activity-item">
                  <div class="activity-dot ${activityDot(a.type)}"></div>
                  <div class="activity-content">
                    <div class="activity-title">${a.title}</div>
                    <div class="activity-meta">${a.party} · ${formatRelativeDate(a.timestamp)}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  buyerApprovals() {
    const pending = getInvoicesForRole('buyer').filter((i) => i.status === 'pending');

    if (!pending.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('check-circle')}
            <h3>Approval queue is clear</h3>
            <p class="mt-2">New supplier invoices will appear here for your review.</p>
          </div>
        </div>
      `;
    }

    return pending.map((inv) => `
      <div class="card mb-4" data-invoice-id="${inv.id}">
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h4>${inv.invoiceNumber}</h4>
              <p class="text-sm text-secondary">${inv.supplierName || getSupplierName(inv.supplierId)} · PO ${inv.poNumber}</p>
            </div>
            ${statusBadge(inv.status)}
          </div>
          <div class="detail-grid mb-4">
            <div class="detail-item">
              <label>Amount</label>
              <div class="value large">${formatCurrency(inv.amount)}</div>
            </div>
            <div class="detail-item">
              <label>Due Date</label>
              <div class="value">${formatDate(inv.dueDate)}</div>
            </div>
            <div class="detail-item">
              <label>Issue Date</label>
              <div class="value">${formatDate(inv.issueDate)}</div>
            </div>
            <div class="detail-item">
              <label>Line Items</label>
              <div class="value">${inv.lineItems}</div>
            </div>
          </div>
          <p class="text-sm text-secondary mb-4">${inv.description}</p>
          <div class="flex gap-3">
            <button class="btn btn-primary" data-action="approve" data-invoice-id="${inv.id}">
              ${icon('check-circle')} Approve
            </button>
            <button class="btn btn-secondary" data-action="reject" data-invoice-id="${inv.id}">
              Reject
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  buyerInvoices() {
    const invoices = getInvoicesForRole('buyer');
    return `
      <div class="filter-bar">
        <div class="filter-pills">
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="pending">Pending</button>
          <button class="filter-pill" data-filter="approved">Approved</button>
          <button class="filter-pill" data-filter="funded">Funded</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map((i) => `
                <tr data-invoice-id="${i.id}" data-status="${i.status}">
                  <td class="text-mono">${i.invoiceNumber}</td>
                  <td>${i.supplierName || getSupplierName(i.supplierId)}</td>
                  <td class="font-medium">${formatCurrency(i.amount)}</td>
                  <td>${formatDate(i.dueDate)}</td>
                  <td>${statusBadge(i.status)}</td>
                  <td class="text-secondary">${i.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buyerSuppliers() {
    const suppliers = getSuppliers();
    const programs = getProgramsForRole('buyer');
    return `
      <div class="callout callout-info mb-6">
        <strong>Rule:</strong> One program → one buyer. Suppliers are enrolled per program — view program membership below.
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Program Suppliers (${suppliers.length})</h3>
          <a href="#/buyer/add-supplier" class="btn btn-primary btn-sm">${icon('user-plus')} Add Supplier</a>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>POC</th>
                <th>Programs</th>
                <th>Status</th>
                <th>Total Invoiced</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map((s) => {
                const enrolled = (s.enrolledPrograms || [])
                  .map((pid) => programs.find((p) => p.id === pid)?.name || pid)
                  .join(', ');
                return `
                <tr>
                  <td class="text-mono">${s.id}</td>
                  <td class="font-medium">${s.name}</td>
                  <td>${s.pocName || '—'}</td>
                  <td class="text-sm text-secondary">${enrolled || '—'}</td>
                  <td>${statusBadge(s.status)}</td>
                  <td>${formatCurrency(s.totalInvoiced)}</td>
                  <td>${riskBadge(s.riskRating)}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buyerAddSupplier() {
    const programs = getProgramsForRole('buyer');
    const buyer = getParty('buyer');
    const nextId = getNextSupplierId();

    return `
      <div class="callout callout-info mb-6">
        <strong>One program · one buyer.</strong> Select the program to enroll this supplier under
        <strong>${buyer.name}</strong> (${buyer.id}). New supplier ID: <strong>${nextId}</strong>.
      </div>

      <form id="add-supplier-form" class="add-supplier-form">
        <div class="card mb-5">
          <div class="card-header"><h3>Select Program<span class="required">*</span></h3></div>
          <div class="card-body">
            <p class="text-secondary text-sm mb-4">Supplier will be added only to the selected program.</p>
            <div class="program-checkboxes">
              ${programs.map((p, i) => `
                <label class="program-checkbox">
                  <input type="radio" name="programId" value="${p.id}" ${i === 0 ? 'required' : ''} ${i === 0 ? 'checked' : ''} />
                  <span class="program-checkbox-box program-radio"></span>
                  <span class="program-checkbox-text">
                    <strong>${p.name}</strong>
                    <span>${programTypeLabel(p.type)} · Buyer: ${getCompanyName(p.buyerId)} · ${p.discountRate}% · ${formatCurrency(p.limit)}</span>
                    <span class="text-xs">${(p.enrolledSupplierIds || []).length} suppliers · ${(p.enrolledFunderIds || []).length} banks enrolled</span>
                  </span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card mb-5">
          <div class="card-header"><h3>Company Details</h3></div>
          <div class="card-body">
            <div class="form-grid">
              <div class="form-group form-group-span-2">
                <label class="form-label">Company Name<span class="required">*</span></label>
                <input class="form-input" name="companyName" required placeholder="e.g. Lahore Steel Works (Pvt.) Ltd." />
              </div>
              <div class="form-group">
                <label class="form-label">NTN / Registration No.</label>
                <input class="form-input" name="ntn" placeholder="e.g. 1234567-8" />
              </div>
              <div class="form-group">
                <label class="form-label">Industry</label>
                <select class="form-select" name="industry">
                  <option value="">Select industry</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-input" name="city" placeholder="e.g. Karachi" />
              </div>
              <div class="form-group">
                <label class="form-label">Country</label>
                <input class="form-input" value="Pakistan" readonly />
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-5">
          <div class="card-header"><h3>Point of Contact</h3></div>
          <div class="card-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">POC Name<span class="required">*</span></label>
                <input class="form-input" name="pocName" required placeholder="e.g. Hassan Raza" />
              </div>
              <div class="form-group">
                <label class="form-label">Designation<span class="required">*</span></label>
                <input class="form-input" name="designation" required placeholder="e.g. Finance Manager" />
              </div>
              <div class="form-group">
                <label class="form-label">Email<span class="required">*</span></label>
                <input class="form-input" name="email" type="email" required placeholder="name@company.pk" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-input" name="phone" placeholder="+92 300 1234567" />
              </div>
            </div>
            <div class="form-grid mt-4">
              <div class="form-group">
                <label class="form-label">Payment Terms (days)</label>
                <input class="form-input" name="paymentTerms" type="number" min="30" max="120" value="60" />
              </div>
              <div class="form-group">
                <label class="form-label">Risk Rating</label>
                <select class="form-select" name="riskRating">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-5">
          <div class="card-header"><h3>Notes</h3></div>
          <div class="card-body">
            <div class="form-group mb-0">
              <textarea class="form-textarea" name="notes" placeholder="Optional internal notes…"></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel-add-supplier">Cancel</button>
          <button type="submit" class="btn btn-primary btn-lg">${icon('user-plus')} Enroll Supplier</button>
        </div>
      </form>
    `;
  },

  buyerAddBank() {
    const programs = getProgramsForRole('buyer').filter((p) => p.type !== 'dynamic_discounting');
    const buyer = getParty('buyer');

    return `
      <div class="callout callout-info mb-6">
        <strong>One program · one buyer.</strong> Enroll a bank/funder into a program under
        <strong>${buyer.name}</strong>. Banks join the program — not the buyer directly.
      </div>

      <form id="add-bank-form" class="add-supplier-form">
        <div class="card mb-5">
          <div class="card-header"><h3>Select Program<span class="required">*</span></h3></div>
          <div class="card-body">
            ${programs.length ? `
              <div class="program-checkboxes">
                ${programs.map((p, i) => `
                  <label class="program-checkbox">
                    <input type="radio" name="programId" value="${p.id}" required ${i === 0 ? 'checked' : ''} data-program-id="${p.id}" />
                    <span class="program-checkbox-box program-radio"></span>
                    <span class="program-checkbox-text">
                      <strong>${p.name}</strong>
                      <span>${programTypeLabel(p.type)} · ${(p.enrolledFunderIds || []).length} banks currently enrolled</span>
                    </span>
                  </label>
                `).join('')}
              </div>
            ` : `<p class="text-secondary">No bank-funded programs available. Dynamic discounting programs are buyer-funded.</p>`}
          </div>
        </div>

        ${programs.length ? `
        <div class="card mb-5">
          <div class="card-header"><h3>Select Bank<span class="required">*</span></h3></div>
          <div class="card-body">
            <div class="form-group mb-0">
              <label class="form-label">Bank / Funder</label>
              <select class="form-select" name="bankId" required id="bank-select">
                ${getAvailableBanksForProgram(programs[0]?.id).map((b) => `
                  <option value="${b.id}">${b.id} · ${b.name} — ${b.pocName}</option>
                `).join('')}
              </select>
              <p class="text-xs text-secondary mt-2">Only banks not yet enrolled in the selected program are shown.</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel-add-bank">Cancel</button>
          <button type="submit" class="btn btn-primary btn-lg">${icon('landmark')} Enroll Bank</button>
        </div>
        ` : ''}
      </form>
    `;
  },

  buyerPrograms() {
    return Views.programsList(getProgramsForRole('buyer'), 'buyer');
  },

  /* ── Funder Views ────────────────────────────────────────────── */
  funderDashboard() {
    const stats = computeFunderStats();
    const opportunities = getFundingOpportunities().filter((o) => o.status === 'available');
    const activities = getActivitiesForRole('funder').slice(0, 5);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('trending-up')}</div>
          <div class="stat-text">
            <div class="stat-label">Available Opportunities</div>
            <div class="stat-value">${formatCurrency(stats.availableAmount)}</div>
            <div class="stat-change positive">${stats.availableCount} requests ready</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('briefcase')}</div>
          <div class="stat-text">
            <div class="stat-label">Deployed Capital</div>
            <div class="stat-value">${formatCurrency(stats.deployed)}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile orange">${icon('inbox')}</div>
          <div class="stat-text">
            <div class="stat-label">Pending Review</div>
            <div class="stat-value">${stats.pendingReview}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Expected Yield</div>
            <div class="stat-value">${formatCurrency(stats.expectedYield)}</div>
            <div class="stat-change">from open opportunities</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>Funding Queue</h3>
            <a href="#/funder/opportunities" class="btn btn-ghost btn-sm">View all</a>
          </div>
          <div class="card-body">
            ${opportunities.length ? opportunities.map((o) => `
              <div class="opportunity-card" data-opp-id="${o.id}">
                <div class="opportunity-info">
                  <h4>${o.supplierName}</h4>
                  <div class="opportunity-meta">${o.buyerName} · ${o.tenor} day tenor · ${o.discountRate}% rate</div>
                </div>
                <div class="opportunity-amount">
                  <div class="amount">${formatCurrency(o.amount)}</div>
                  <div class="rate">+${formatCurrency(o.expectedYield)} yield</div>
                </div>
              </div>
            `).join('') : '<div class="empty-state"><p>No opportunities in queue.</p></div>'}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Activity</h3></div>
          <div class="card-body">
            <ul class="activity-feed">
              ${activities.map((a) => `
                <li class="activity-item">
                  <div class="activity-dot ${activityDot(a.type)}"></div>
                  <div class="activity-content">
                    <div class="activity-title">${a.title}</div>
                    <div class="activity-meta">${formatRelativeDate(a.timestamp)}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  funderOpportunities() {
    const opportunities = getFundingOpportunities();
    return `
      <p class="text-secondary mb-6">Review and fund approved invoice discounting requests from enrolled supplier programs.</p>
      ${opportunities.map((o) => `
        <div class="card mb-4" data-opp-id="${o.id}">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h4>${o.supplierName}</h4>
                <p class="text-sm text-secondary">Invoice ${o.invoiceId} · Buyer: ${o.buyerName}</p>
              </div>
              ${statusBadge(o.status)}
            </div>
            <div class="detail-grid mb-4">
              <div class="detail-item">
                <label>Face Value</label>
                <div class="value large">${formatCurrency(o.amount)}</div>
              </div>
              <div class="detail-item">
                <label>Discount Rate</label>
                <div class="value">${o.discountRate}% p.a.</div>
              </div>
              <div class="detail-item">
                <label>Tenor</label>
                <div class="value">${o.tenor} days</div>
              </div>
              <div class="detail-item">
                <label>Expected Yield</label>
                <div class="value" style="color: var(--color-success)">+${formatCurrency(o.expectedYield)}</div>
              </div>
            </div>
            ${o.status === 'available' ? `
              <div class="flex gap-3">
                <button class="btn btn-primary" data-action="fund" data-opp-id="${o.id}">Fund Invoice</button>
                <button class="btn btn-secondary" data-action="decline" data-opp-id="${o.id}">Decline</button>
              </div>
            ` : o.status === 'pending_review' ? `
              <button class="btn btn-primary" data-action="fund" data-opp-id="${o.id}">Approve & Fund</button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    `;
  },

  funderPortfolio() {
    const funded = getInvoicesForRole('funder').filter(
      (i) => i.fundingStatus === 'disbursed' || i.status === 'funded'
    );

    return `
      <div class="stats-grid cols-3 mb-6">
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('briefcase')}</div>
          <div class="stat-text">
            <div class="stat-label">Active Positions</div>
            <div class="stat-value">${funded.length}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Total Deployed</div>
            <div class="stat-value">${formatCurrency(funded.reduce((s, i) => s + (i.fundedAmount || i.amount), 0))}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('trending-up')}</div>
          <div class="stat-text">
            <div class="stat-label">Weighted Avg. Rate</div>
            <div class="stat-value">4.25%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Supplier</th>
                <th>Face Value</th>
                <th>Funded Amount</th>
                <th>Funded Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${funded.map((i) => `
                <tr>
                  <td class="text-mono">${i.invoiceNumber}</td>
                  <td>${i.supplierName || getSupplierName(i.supplierId)}</td>
                  <td>${formatCurrency(i.amount)}</td>
                  <td class="font-medium">${formatCurrency(i.fundedAmount || i.amount)}</td>
                  <td>${formatDate(i.fundedDate)}</td>
                  <td>${formatDate(i.dueDate)}</td>
                  <td>${statusBadge(i.fundingStatus || i.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  funderPrograms() {
    return Views.programsList(getProgramsForRole('funder'), 'funder');
  },

  /* ── Shared ──────────────────────────────────────────────────── */
  programsList(programs, role) {
    if (!programs.length) {
      return `<div class="card"><div class="empty-state"><p>No programs enrolled.</p></div></div>`;
    }

    return programs.map((p) => {
      const suppliers = getSuppliersForProgram(p.id);
      const funders = getFundersForProgram(p.id);
      const buyerName = getCompanyName(p.buyerId);

      return `
      <div class="program-card mb-4">
        <div class="program-card-header">
          <div>
            <h4>${p.name}</h4>
            <p class="text-sm text-secondary">${programTypeLabel(p.type)} · ${statusBadge(p.status)} · ${p.id}</p>
          </div>
          ${role === 'buyer' ? `
            <div class="flex gap-2">
              <a href="#/buyer/add-supplier" class="btn btn-secondary btn-sm">${icon('user-plus')} Supplier</a>
              ${p.type !== 'dynamic_discounting' ? `<a href="#/buyer/add-bank" class="btn btn-secondary btn-sm">${icon('landmark')} Bank</a>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="callout callout-info mb-4" style="margin-top: var(--space-4);">
          <strong>Buyer:</strong> ${buyerName} (${p.buyerId}) — one program, one buyer
        </div>

        <p class="text-sm text-secondary mb-4">${p.description}</p>

        <div class="program-metrics">
          <div class="program-metric">
            <label>Facility Limit</label>
            <span>${formatCurrency(p.limit)}</span>
          </div>
          <div class="program-metric">
            <label>Utilized</label>
            <span>${formatCurrency(p.utilized)} (${pct(p.utilized, p.limit)}%)</span>
          </div>
          <div class="program-metric">
            <label>Discount Rate</label>
            <span>${p.discountRate}% p.a.</span>
          </div>
          <div class="program-metric">
            <label>Max Tenor</label>
            <span>${p.maxTenor} days</span>
          </div>
          <div class="program-metric">
            <label>Suppliers</label>
            <span>${suppliers.length} enrolled</span>
          </div>
          <div class="program-metric">
            <label>Banks</label>
            <span>${funders.length} enrolled</span>
          </div>
        </div>

        <div class="program-parties mt-4">
          <div class="program-party-col">
            <h5 class="text-xs font-semibold text-secondary mb-2">ENROLLED SUPPLIERS</h5>
            ${suppliers.length ? suppliers.map((s) => `
              <div class="program-party-chip">${s.id} · ${s.name}</div>
            `).join('') : '<span class="text-sm text-muted">None</span>'}
          </div>
          <div class="program-party-col">
            <h5 class="text-xs font-semibold text-secondary mb-2">ENROLLED BANKS</h5>
            ${funders.length ? funders.map((b) => `
              <div class="program-party-chip">${b.id} · ${b.name}</div>
            `).join('') : `<span class="text-sm text-muted">${p.type === 'dynamic_discounting' ? 'Buyer-funded (no bank)' : 'None'}</span>`}
          </div>
        </div>
      </div>
    `}).join('');
  },

  invoiceDetail(inv) {
    const steps = [
      { label: 'Invoice Submitted', date: inv.issueDate, completed: true },
      { label: 'Buyer Approved', date: inv.approvedDate, completed: !!inv.approvedDate, active: inv.status === 'pending' },
      { label: 'Funding Requested', date: inv.fundingStatus === 'requested' ? 'Pending' : null, completed: !!inv.fundingStatus, active: inv.status === 'approved' && !inv.fundingStatus },
      { label: 'Funds Disbursed', date: inv.fundedDate, completed: inv.fundingStatus === 'disbursed', active: inv.fundingStatus === 'requested' },
      { label: 'Settled at Maturity', date: inv.paidDate, completed: inv.status === 'paid' },
    ];

    return `
      <div class="detail-grid mb-6">
        <div class="detail-item">
          <label>Invoice Number</label>
          <div class="value">${inv.invoiceNumber}</div>
        </div>
        <div class="detail-item">
          <label>PO Number</label>
          <div class="value">${inv.poNumber}</div>
        </div>
        <div class="detail-item">
          <label>Amount</label>
          <div class="value large">${formatCurrency(inv.amount)}</div>
        </div>
        <div class="detail-item">
          <label>Status</label>
          <div class="value">${statusBadge(inv.status)}</div>
        </div>
        <div class="detail-item">
          <label>Issue Date</label>
          <div class="value">${formatDate(inv.issueDate)}</div>
        </div>
        <div class="detail-item">
          <label>Due Date</label>
          <div class="value">${formatDate(inv.dueDate)}</div>
        </div>
      </div>
      <p class="text-secondary mb-6">${inv.description}</p>
      <h4 class="mb-4">Payment Timeline</h4>
      <div class="timeline">
        ${steps.map((s) => `
          <div class="timeline-step ${s.completed ? 'completed' : ''} ${s.active ? 'active' : ''}">
            <div class="timeline-step-title">${s.label}</div>
            <div class="timeline-step-date">${s.date ? formatDate(s.date) : '—'}</div>
          </div>
        `).join('')}
      </div>
      ${inv.discountOffer ? `
        <h4 class="mb-4 mt-6">Discount Offer</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Rate</label>
            <div class="value">${inv.discountOffer.rate}% p.a.</div>
          </div>
          <div class="detail-item">
            <label>Net Proceeds</label>
            <div class="value">${formatCurrency(inv.discountOffer.netProceeds)}</div>
          </div>
        </div>
      ` : ''}
    `;
  },
};
