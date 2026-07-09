const Views = {
  /* â”€â”€ Landing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  landing() {
    const { suppliers, buyers, banks } = getAllDemoEntities();
    const buyer = buyers.find((b) => b.id === 'BUY-002');
    const supplier = suppliers.find((s) => s.id === 'SUP-005');
    const funder = banks.find((b) => b.id === 'BNK-004');

    return `
      <div class="landing">
        <header class="landing-header">
          <a href="#/" class="landing-logo">
            <img src="assets/logo.png" alt="TradeOrigin">
          </a>
          <span class="landing-header-meta">Supply Chain Finance Â· Prototype</span>
        </header>
        <section class="landing-hero">
          <div class="landing-parties">
            <button type="button" class="landing-party" onclick="setActiveEntity('buyer', 'BUY-002'); location.hash='#/buyer/transactions';">
              <span class="landing-party-role">Buyer</span>
              <span class="landing-party-name">${buyer?.companyName || 'ABC Retail'}</span>
              <span class="landing-party-poc">${buyer?.pocName || ''}</span>
              <span class="landing-party-id">BUY-002</span>
            </button>
            <button type="button" class="landing-party" onclick="setActiveEntity('supplier', 'SUP-005'); location.hash='#/supplier/dashboard';">
              <span class="landing-party-role">Supplier</span>
              <span class="landing-party-name">${supplier?.companyName || 'XYZ Foods'}</span>
              <span class="landing-party-poc">${supplier?.pocName || ''}</span>
              <span class="landing-party-id">SUP-005</span>
            </button>
            <button type="button" class="landing-party" onclick="setActiveEntity('funder', 'BNK-004'); location.hash='#/funder/dashboard';">
              <span class="landing-party-role">Funder</span>
              <span class="landing-party-name">${funder?.companyName || 'Easypaisa Digital Bank'}</span>
              <span class="landing-party-poc">${funder?.pocName || ''}</span>
              <span class="landing-party-id">BNK-004</span>
            </button>
          </div>
        </section>
        <footer class="landing-footer">
          Â© 2026 TradeOrigin Â· Prototype â€” HTML / CSS / JS + JSON
        </footer>
      </div>
    `;
  },

  /* â”€â”€ Supplier Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  supplierDashboard() {
    const txns = getTransactionsForRole('supplier');
    const totalFinanced = txns.reduce((sum, t) => sum + t.totalAmount, 0);
    const disbursedCount = txns.filter((t) => ['disbursed', 'repaying', 'closed'].includes(t.status)).length;
    const pendingCount = txns.filter((t) => ['submitted', 'approved'].includes(t.status)).length;
    const currency = txns[0]?.currency || 'PKR';

    if (!txns.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('repeat')}
            <h3>No financing transactions</h3>
            <p class="mt-2">SCF transactions initiated by your buyer will appear here.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('repeat')}</div>
          <div class="stat-text">
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">${txns.length}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Total Financed</div>
            <div class="stat-value">${formatAmt(totalFinanced, currency)}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('clock')}</div>
          <div class="stat-text">
            <div class="stat-label">In Progress</div>
            <div class="stat-value">${pendingCount}</div>
            <div class="stat-change">awaiting approval or disbursement</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile orange">${icon('check-circle')}</div>
          <div class="stat-text">
            <div class="stat-label">Disbursed</div>
            <div class="stat-value">${disbursedCount}</div>
          </div>
        </div>
      </div>

      <div class="filter-bar mt-6">
        <div class="filter-pills">
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="submitted">Submitted</button>
          <button class="filter-pill" data-filter="approved">Approved</button>
          <button class="filter-pill" data-filter="disbursed">Disbursed</button>
          <button class="filter-pill" data-filter="repaying">Repaying</button>
          <button class="filter-pill" data-filter="closed">Closed</button>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Buyer</th>
                <th>Funder</th>
                <th>Amount Financed</th>
                <th>Invoices</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${txns.map((t) => `
                <tr data-txn-id="${t.id}" data-status="${t.status}" class="txn-row" style="cursor:pointer">
                  <td class="text-mono font-medium">${t.id}</td>
                  <td>${getCompanyName(t.buyerId)}</td>
                  <td>${getCompanyName(t.funderId)}</td>
                  <td class="font-medium">${formatAmt(t.totalAmount, t.currency)}</td>
                  <td class="text-secondary">${t.invoiceIds.length} invoice${t.invoiceIds.length !== 1 ? 's' : ''}</td>
                  <td>${statusBadge(t.status)}</td>
                  <td>${formatDate(t.submittedDate)}</td>
                  <td><button class="btn btn-ghost btn-sm" data-action="view-transaction" data-txn-id="${t.id}">View</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${disbursedCount ? `
        <div class="callout callout-success mt-6">
          ${icon('check-circle')} <strong>Financing Advice:</strong> Funds disbursed to your registered bank account.
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
                <div class="value">âˆ’${formatCurrency(inv.discountOffer?.discountAmount)}</div>
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

  /* â”€â”€ Buyer Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
          ` : `<div class="empty-state"><p>All invoices reviewed â€” no pending approvals.</p></div>`}
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
                    <div class="activity-meta">${a.party} Â· ${formatRelativeDate(a.timestamp)}</div>
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
              <p class="text-sm text-secondary">${inv.supplierName || getSupplierName(inv.supplierId)} Â· PO ${inv.poNumber}</p>
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
        <strong>Rule:</strong> One program â†’ one buyer. Suppliers are enrolled per program â€” view program membership below.
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
                  <td>${s.pocName || 'â€”'}</td>
                  <td class="text-sm text-secondary">${enrolled || 'â€”'}</td>
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
        <strong>One program Â· one buyer.</strong> Select the program to enroll this supplier under
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
                    <span>${programTypeLabel(p.type)} Â· Buyer: ${getCompanyName(p.buyerId)} Â· ${p.discountRate}% Â· ${formatCurrency(p.limit)}</span>
                    <span class="text-xs">${(p.enrolledSupplierIds || []).length} suppliers Â· ${(p.enrolledFunderIds || []).length} banks enrolled</span>
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
              <textarea class="form-textarea" name="notes" placeholder="Optional internal notesâ€¦"></textarea>
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
        <strong>One program Â· one buyer.</strong> Enroll a bank/funder into a program under
        <strong>${buyer.name}</strong>. Banks join the program â€” not the buyer directly.
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
                      <span>${programTypeLabel(p.type)} Â· ${(p.enrolledFunderIds || []).length} banks currently enrolled</span>
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
                  <option value="${b.id}">${b.id} Â· ${b.name} â€” ${b.pocName}</option>
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

  buyerManageProgram() {
    const program =
      getProgramsForRole('buyer').find((p) => p.id === 'PRG-003') ||
      getProgramsForRole('buyer').find((p) => p.status === 'active') ||
      getProgramsForRole('buyer')[0];

    if (!program) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('layers')}
            <h3>No program configured</h3>
            <p class="mt-2">Start by setting up your Receivable Finance Program.</p>
          </div>
        </div>
      `;
    }

    const suppliers = getSuppliersForProgram(program.id);
    const funders = getFundersForProgram(program.id);
    const currency = program.currency || 'PKR';

    const supplierRows = suppliers.length
      ? suppliers.map((s) => `
          <tr>
            <td class="text-mono">${s.id}</td>
            <td class="font-medium">${s.name}</td>
            <td>${s.pocName || '—'}</td>
            <td class="text-secondary">${s.designation || '—'}</td>
            <td>${s.email || '—'}</td>
            <td>${statusBadge(s.status)}</td>
            <td class="mp-actions">
              <button type="button" class="btn btn-ghost btn-sm" data-action="mp-edit-supplier"
                      data-supplier-id="${s.id}" data-program-id="${program.id}">Edit</button>
              <button type="button" class="btn btn-ghost btn-sm mp-btn-danger" data-action="mp-delete-supplier"
                      data-supplier-id="${s.id}" data-program-id="${program.id}" data-supplier-name="${s.name}">Delete</button>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="7" class="text-secondary text-center py-6">No suppliers enrolled yet.</td></tr>`;

    const funderRows = funders.length
      ? funders.map((b) => {
          const invite = getFunderInviteForProgram(b.id, program.id);
          const rate = invite?.agreedRate ?? b.agreedRate ?? program.discountRate ?? '—';
          const limit = invite?.financingLimit ?? b.financingLimit ?? program.limit;
          return `
          <tr>
            <td class="text-mono">${b.id}</td>
            <td class="font-medium">${b.name}</td>
            <td>${b.pocName || '—'}</td>
            <td>${rate !== '—' ? rate + '% p.a.' : '—'}</td>
            <td>${formatAmt(limit, currency)}</td>
            <td>${statusBadge(b.status || 'active')}</td>
            <td class="mp-actions">
              <button type="button" class="btn btn-ghost btn-sm" data-action="mp-edit-funder"
                      data-bank-id="${b.id}" data-program-id="${program.id}">Edit</button>
              <button type="button" class="btn btn-ghost btn-sm mp-btn-danger" data-action="mp-delete-funder"
                      data-bank-id="${b.id}" data-program-id="${program.id}" data-bank-name="${b.name}">Delete</button>
            </td>
          </tr>
        `;
        }).join('')
      : `<tr><td colspan="7" class="text-secondary text-center py-6">No funders enrolled yet.</td></tr>`;

    return `
      <div class="mp-page">
        <p class="mp-intro">
          Manage suppliers and funders enrolled in <strong>${program.name}</strong> (${program.id}).
        </p>

        <section class="rf-step mp-step">
          <div class="mp-section-top">
            ${rfStepHead(1, 'Suppliers', true)}
            <button type="button" class="btn btn-primary btn-sm" data-action="mp-add-supplier" data-program-id="${program.id}">
              ${icon('user-plus')} Add Supplier
            </button>
          </div>
          <div class="card mp-table-card">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>POC</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${supplierRows}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="rf-step mp-step">
          <div class="mp-section-top">
            ${rfStepHead(2, 'Funders', true)}
            <button type="button" class="btn btn-primary btn-sm" data-action="mp-add-funder" data-program-id="${program.id}">
              ${icon('landmark')} Add Funder
            </button>
          </div>
          <div class="card mp-table-card">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bank</th>
                    <th>POC</th>
                    <th>Rate</th>
                    <th>Limit</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${funderRows}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  buyerPrograms() {
    return Views.buyerManageProgram();
  },

  mpAddSupplierModal(programId, available, nextId) {
    return `
      ${available.length ? `
        <div class="form-group">
          <label class="form-label">Enroll existing supplier</label>
          <select class="form-select" id="mp-existing-supplier">
            <option value="">— Create new supplier —</option>
            ${available.map((s) => `<option value="${s.id}">${s.id} · ${s.name}</option>`).join('')}
          </select>
        </div>
        <hr class="mp-divider">
      ` : ''}
      <div id="mp-new-supplier-fields">
        <p class="text-xs text-secondary mb-3">New supplier ID: <strong>${nextId}</strong></p>
        <div class="form-grid">
          <div class="form-group form-group-span-2">
            <label class="form-label">Company Name<span class="required">*</span></label>
            <input class="form-input" id="mp-supplier-company" placeholder="e.g. Lahore Steel Works (Pvt.) Ltd.">
          </div>
          <div class="form-group">
            <label class="form-label">POC Name<span class="required">*</span></label>
            <input class="form-input" id="mp-supplier-poc" placeholder="Full name">
          </div>
          <div class="form-group">
            <label class="form-label">Designation<span class="required">*</span></label>
            <input class="form-input" id="mp-supplier-designation" placeholder="e.g. Finance Manager">
          </div>
          <div class="form-group">
            <label class="form-label">Email<span class="required">*</span></label>
            <input class="form-input" type="email" id="mp-supplier-email" placeholder="email@company.pk">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" id="mp-supplier-phone" placeholder="+92 300 1234567">
          </div>
        </div>
      </div>
    `;
  },

  mpEditSupplierModal(supplier) {
    return `
      <div class="form-grid">
        <div class="form-group form-group-span-2">
          <label class="form-label">Company Name</label>
          <input class="form-input" id="mp-edit-supplier-company" value="${supplier.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">POC Name</label>
          <input class="form-input" id="mp-edit-supplier-poc" value="${supplier.pocName || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Designation</label>
          <input class="form-input" id="mp-edit-supplier-designation" value="${supplier.designation || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" id="mp-edit-supplier-email" value="${supplier.email || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" id="mp-edit-supplier-phone" value="${supplier.phone || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="mp-edit-supplier-status">
            <option value="active" ${supplier.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="pending" ${supplier.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="inactive" ${supplier.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
    `;
  },

  mpAddFunderModal(programId, available) {
    if (!available.length) {
      return `<p class="text-secondary">All registered banks are already enrolled in this program.</p>`;
    }
    return `
      <div class="form-group mb-0">
        <label class="form-label">Select bank / funder<span class="required">*</span></label>
        <select class="form-select" id="mp-funder-select">
          ${available.map((b) => `<option value="${b.id}">${b.id} · ${b.name} — ${b.pocName || ''}</option>`).join('')}
        </select>
      </div>
    `;
  },

  mpEditFunderModal(bank, programId, currency) {
    const invite = getFunderInviteForProgram(bank.id, programId);
    const rate = invite?.agreedRate ?? bank.agreedRate ?? '';
    const limit = invite?.financingLimit ?? bank.financingLimit ?? '';
    return `
      <div class="form-grid">
        <div class="form-group form-group-span-2">
          <label class="form-label">Bank</label>
          <input class="form-input cp-readonly-input" readonly value="${bank.name} (${bank.id})">
        </div>
        <div class="form-group">
          <label class="form-label">POC Name</label>
          <input class="form-input" id="mp-edit-funder-poc" value="${bank.pocName || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Designation</label>
          <input class="form-input" id="mp-edit-funder-designation" value="${bank.designation || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Agreed Rate (% p.a.)</label>
          <input class="form-input" type="number" step="0.1" id="mp-edit-funder-rate" value="${rate}">
        </div>
        <div class="form-group">
          <label class="form-label">Financing Limit (${currency})</label>
          <input class="form-input" type="number" id="mp-edit-funder-limit" value="${limit}">
        </div>
      </div>
    `;
  },

  /* â”€â”€ Funder Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  funderDashboard() {
    const txns = getTransactionsForRole('funder');
    const pending = txns.filter((t) => t.status === 'submitted');
    const pendingAmount = pending.reduce((s, t) => s + t.totalAmount, 0);
    const activities = getActivitiesForRole('funder').slice(0, 5);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-tile orange">${icon('inbox')}</div>
          <div class="stat-text">
            <div class="stat-label">Pending Requests</div>
            <div class="stat-value">${pending.length}</div>
            <div class="stat-change">${formatAmt(pendingAmount, pending[0]?.currency || 'PKR')} awaiting review</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile purple">${icon('repeat')}</div>
          <div class="stat-text">
            <div class="stat-label">Total Requests</div>
            <div class="stat-value">${txns.length}</div>
            <div class="stat-change">on your enrolled programs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile green">${icon('check-circle')}</div>
          <div class="stat-text">
            <div class="stat-label">Approved</div>
            <div class="stat-value">${txns.filter((t) => t.status === 'approved').length}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-tile blue">${icon('dollar')}</div>
          <div class="stat-text">
            <div class="stat-label">Request Value</div>
            <div class="stat-value">${formatAmt(txns.reduce((s, t) => s + t.totalAmount, 0), txns[0]?.currency || 'PKR')}</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>Financing Requests</h3>
          </div>
          ${txns.length ? `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Supplier</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Invoices</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${txns.map((t) => `
                    <tr data-txn-id="${t.id}" class="txn-row" style="cursor:pointer">
                      <td class="text-mono font-medium">${t.id}</td>
                      <td>${getCompanyName(t.supplierId)}</td>
                      <td>${getCompanyName(t.buyerId)}</td>
                      <td class="font-medium">${formatAmt(t.totalAmount, t.currency)}</td>
                      <td class="text-secondary">${t.invoiceIds.length} invoice${t.invoiceIds.length !== 1 ? 's' : ''}</td>
                      <td>${statusBadge(t.status)}</td>
                      <td>${formatDate(t.submittedDate)}</td>
                      <td><button class="btn btn-ghost btn-sm" data-action="view-transaction" data-txn-id="${t.id}">View</button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              ${icon('repeat')}
              <h3>No financing requests</h3>
              <p class="mt-2">SCF financing requests from your enrolled programs will appear here.</p>
            </div>
          `}
        </div>

        <div class="card">
          <div class="card-header"><h3>Activity</h3></div>
          <div class="card-body">
            <ul class="activity-feed">
              ${activities.length ? activities.map((a) => `
                <li class="activity-item">
                  <div class="activity-dot ${activityDot(a.type)}"></div>
                  <div class="activity-content">
                    <div class="activity-title">${a.title}</div>
                    <div class="activity-meta">${formatRelativeDate(a.timestamp)}</div>
                  </div>
                </li>
              `).join('') : '<li class="activity-item"><div class="activity-content"><div class="activity-title text-secondary">No recent activity</div></div></li>'}
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
                <p class="text-sm text-secondary">Invoice ${o.invoiceId} Â· Buyer: ${o.buyerName}</p>
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

  /* â”€â”€ Buyer â€” SCF Program & Transaction Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  buyerCreateProgram() {
    const buyer = getParty('buyer');
    const { suppliers, banks } = getAllDemoEntities();
    const programName = `${buyer.name} SCF Program`;

    return `
      <form id="create-program-form" class="add-supplier-form">

        <!-- Section 1: Program Name -->
        <div class="card cf-step mb-5">
          <div class="cf-step-header">
            <div class="cf-step-badge">1</div>
            <div>
              <h3>Program Name</h3>
              <p class="text-xs text-secondary">Auto-generated from your company name</p>
            </div>
          </div>
          <div class="cf-step-body">
            <div class="form-group mb-0">
              <label class="form-label">Program Name</label>
              <input class="form-input cp-readonly-input" name="programName" readonly value="${programName}" />
            </div>
          </div>
        </div>

        <!-- Section 2: Add Suppliers -->
        <div class="card cf-step mb-5">
          <div class="cf-step-header">
            <div class="cf-step-badge">2</div>
            <div>
              <h3>Add Suppliers</h3>
              <p class="text-xs text-secondary">Click a row to select or deselect &mdash; multiple suppliers allowed</p>
            </div>
          </div>
          <div class="cf-step-body">
            <div class="table-wrap">
              <table class="data-table cp-select-table">
                <thead>
                  <tr>
                    <th class="cp-col-check"></th>
                    <th>ID</th>
                    <th>Company Name</th>
                    <th>POC Name</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  ${suppliers.map((s) => `
                    <tr class="cp-selectable-row" data-id="${s.id}" data-type="supplier" data-label="${s.companyName}">
                      <td class="cp-col-check"><span class="cp-check-icon">${icon('check')}</span></td>
                      <td class="text-mono">${s.id}</td>
                      <td class="font-medium">${s.companyName}</td>
                      <td>${s.pocName || '&mdash;'}</td>
                      <td class="text-secondary">${s.designation || '&mdash;'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="cp-chips-area" id="selected-suppliers-area" style="display:none">
              <div class="cp-chips-label">Selected Suppliers</div>
              <div class="cp-chips" id="selected-suppliers-chips"></div>
            </div>
          </div>
        </div>

        <!-- Section 3: Add Banks / Funders -->
        <div class="card cf-step mb-5">
          <div class="cf-step-header">
            <div class="cf-step-badge">3</div>
            <div>
              <h3>Add Bank / Funder</h3>
              <p class="text-xs text-secondary">Click a row to select or deselect &mdash; multiple banks allowed</p>
            </div>
          </div>
          <div class="cf-step-body">
            <div class="table-wrap">
              <table class="data-table cp-select-table">
                <thead>
                  <tr>
                    <th class="cp-col-check"></th>
                    <th>ID</th>
                    <th>Bank Name</th>
                    <th>POC Name</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  ${banks.map((b) => `
                    <tr class="cp-selectable-row" data-id="${b.id}" data-type="bank" data-label="${b.companyName}">
                      <td class="cp-col-check"><span class="cp-check-icon">${icon('check')}</span></td>
                      <td class="text-mono">${b.id}</td>
                      <td class="font-medium">${b.companyName}</td>
                      <td>${b.pocName || '&mdash;'}</td>
                      <td class="text-secondary">${b.designation || '&mdash;'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="cp-chips-area" id="selected-banks-area" style="display:none">
              <div class="cp-chips-label">Selected Banks</div>
              <div class="cp-chips" id="selected-banks-chips"></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="cf-form-footer">
          <a href="#/buyer/programs" class="btn btn-secondary btn-lg">Cancel</a>
          <button type="submit" class="btn btn-primary btn-lg">${icon('send')} Create Program</button>
        </div>

      </form>
    `;
  },

  buyerTransactions() {
    const txns = getTransactionsForRole('buyer');

    if (!txns.length) {
      return `
        <div class="callout callout-info mb-6">
          No SCF transactions yet. <a href="#/buyer/create-transaction" class="font-medium">Create your first transaction â†’</a>
        </div>
        <div class="card">
          <div class="empty-state">
            ${icon('repeat')}
            <h3>No transactions</h3>
            <p class="mt-2">Financing transactions for your SCF programs will appear here.</p>
            <a href="#/buyer/create-transaction" class="btn btn-primary mt-4">${icon('plus-circle')} Create Transaction</a>
          </div>
        </div>
      `;
    }

    return `
      <p class="rf-list-intro">
        Streamline your cash flow by converting your receivables into immediate working capital.
      </p>
      <div class="filter-bar">
        <div class="filter-pills">
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="submitted">Submitted</button>
          <button class="filter-pill" data-filter="approved">Approved</button>
          <button class="filter-pill" data-filter="disbursed">Disbursed</button>
          <button class="filter-pill" data-filter="repaying">Repaying</button>
          <button class="filter-pill" data-filter="closed">Closed</button>
        </div>
      </div>
      <div class="card rf-list-card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Supplier</th>
                <th>Funder</th>
                <th>Amount</th>
                <th>Invoices</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${txns.map((t) => `
                <tr data-txn-id="${t.id}" data-status="${t.status}" class="txn-row" style="cursor:pointer">
                  <td class="text-mono font-medium">${t.id}</td>
                  <td>${getCompanyName(t.supplierId)}</td>
                  <td>${getCompanyName(t.funderId)}</td>
                  <td class="font-medium">${formatAmt(t.totalAmount, t.currency)}</td>
                  <td class="text-secondary">${t.invoiceIds.length} invoice${t.invoiceIds.length !== 1 ? 's' : ''}</td>
                  <td>${statusBadge(t.status)}</td>
                  <td>${formatDate(t.submittedDate)}</td>
                  <td><button class="btn btn-ghost btn-sm" data-action="view-transaction" data-txn-id="${t.id}">View â†’</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buyerCreateTransaction() {
    const buyer = getParty('buyer');
    const data = getData();
    const programs = getProgramsForRole('buyer');

    const program =
      programs.find((p) => p.id === 'PRG-003') ||
      programs.find((p) => p.type === 'buyer_initiated_scf' && p.status === 'active') ||
      programs.find((p) => p.status === 'active') ||
      programs[0];

    if (!program) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('layers')}
            <h3>No active SCF program</h3>
            <p class="mt-2">Create or activate an SCF program before submitting a financing request.</p>
            <a href="#/buyer/programs" class="btn btn-primary mt-4">View Programs</a>
          </div>
        </div>
      `;
    }

    const eligibleInvoices = getInvoicesForRole('buyer').filter(
      (i) => i.programId === program.id && i.status === 'approved' && !i.fundingStatus
    );

    if (!eligibleInvoices.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('file-text')}
            <h3>No eligible invoices</h3>
            <p class="mt-2">All approved invoices in <strong>${program.name}</strong> have already been financed, or none are currently available.</p>
            <a href="#/buyer/invoices" class="btn btn-primary mt-4">View Invoices</a>
          </div>
        </div>
      `;
    }

    const supplierId = program.enrolledSupplierIds?.[0];
    const funderId = program.enrolledFunderIds?.[0];
    const supplier = data.suppliers.find((s) => s.id === supplierId);
    const bank = data.banks.find((b) => b.id === funderId);
    const invitation = data.invitations?.find(
      (i) => i.entityId === supplierId && i.type === 'supplier' && i.status === 'accepted'
    );
    const bankAccount = invitation?.bankAccount;
    const funderInvite = data.invitations?.find(
      (i) => i.entityId === funderId && i.type === 'funder' && i.status === 'accepted'
    );

    const rate = program.discountRate || 18.5;
    const currency = program.currency || 'PKR';
    const today = new Date();

    const invoiceRows = eligibleInvoices.map((inv) => {
      const tenor = Math.max(1, Math.ceil((new Date(inv.dueDate) - today) / (1000 * 60 * 60 * 24)));
      return { ...inv, tenor };
    });

    return renderReceivableFinanceForm({
      buyer,
      program,
      supplier,
      bank,
      bankAccount,
      invoiceRows,
      currency,
      rate,
      funderLimit: funderInvite?.financingLimit,
    });
  },

  buyerRepay() {
    const txns = getTransactionsForRole('buyer').filter((t) => ['disbursed', 'repaying', 'closed'].includes(t.status));

    if (!txns.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('clock')}
            <h3>No repayments due</h3>
            <p class="mt-2">Disbursed transactions will appear here for repayment at maturity.</p>
          </div>
        </div>
      `;
    }

    return txns.map((txn) => {
      const invoices = (txn.invoiceIds || []).map((id) => getInvoiceById(id)).filter(Boolean);
      const allRepaid = Object.values(txn.repaymentStatus || {}).every((s) => s === 'repaid');

      return `
        <div class="card mb-5">
          <div class="card-header">
            <div>
              <h4>${txn.id} â€” ${getCompanyName(txn.supplierId)}</h4>
              <p class="text-sm text-secondary">Funder: ${getCompanyName(txn.funderId)} Â· Disbursed: ${formatDate(txn.disbursedDate)}</p>
            </div>
            <div class="flex gap-3 items-center">
              <span class="font-semibold">${formatAmt(txn.totalAmount, txn.currency)}</span>
              ${statusBadge(txn.status)}
            </div>
          </div>
          <div class="card-body">
            ${allRepaid ? `
              <div class="callout callout-success">${icon('check-circle')} All invoices repaid â€” transaction closed.</div>
            ` : `
              <table class="data-table">
                <thead><tr><th>Invoice</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${invoices.map((inv) => {
                    const repaidStatus = txn.repaymentStatus?.[inv.id] || 'pending';
                    return `
                      <tr>
                        <td class="text-mono">${inv.invoiceNumber}</td>
                        <td class="text-secondary">${inv.description}</td>
                        <td class="font-medium">${formatAmt(inv.amount, inv.currency)}</td>
                        <td>${formatDate(inv.dueDate)}</td>
                        <td>${statusBadge(repaidStatus)}</td>
                        <td>
                          ${repaidStatus === 'pending' ? `
                            <button class="btn btn-primary btn-sm" data-action="buyer-repay" data-txn-id="${txn.id}" data-invoice-id="${inv.id}">
                              ${icon('check')} Mark Repaid
                            </button>
                          ` : `<span class="text-sm text-secondary">Settled</span>`}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  /* â”€â”€ Supplier â€” Invitations & Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  supplierInvitations() {
    const invitations = getInvitationsForRole('supplier');

    if (!invitations.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('mail')}
            <h3>No invitations</h3>
            <p class="mt-2">Program invitations from buyers will appear here.</p>
          </div>
        </div>
      `;
    }

    return invitations.map((inv) => {
      const program = getProgramById(inv.programId);
      const isAccepted = inv.status === 'accepted';

      return `
        <div class="card mb-5" data-inv-id="${inv.id}">
          <div class="card-header">
            <div>
              <h4>${icon('mail')} Program Invitation</h4>
              <p class="text-sm text-secondary">${program?.name || inv.programId} Â· Sent ${formatDate(inv.sentDate)}</p>
            </div>
            ${statusBadge(inv.status)}
          </div>
          <div class="card-body">
            <p class="text-secondary mb-4">${inv.message}</p>
            <div class="detail-grid mb-4">
              <div class="detail-item"><label>Program</label><div class="value">${program?.name || inv.programId}</div></div>
              <div class="detail-item"><label>Buyer</label><div class="value">${getCompanyName(program?.buyerId || '')}</div></div>
              <div class="detail-item"><label>Type</label><div class="value">${programTypeLabel(program?.type || '')}</div></div>
              <div class="detail-item"><label>Discount Rate</label><div class="value">${program?.discountRate}% p.a.</div></div>
              <div class="detail-item"><label>Currency</label><div class="value">${program?.currency}</div></div>
              <div class="detail-item"><label>Charges On</label><div class="value" style="text-transform:capitalize">${program?.chargesOn || 'â€”'}</div></div>
            </div>
            ${isAccepted ? `
              <div class="callout callout-success mb-4">
                ${icon('check-circle')} You accepted this invitation on ${formatDate(inv.acceptedDate)}.
              </div>
              ${inv.bankAccount ? `
                <h4 class="mb-3">Beneficiary Bank Account</h4>
                <div class="detail-grid">
                  <div class="detail-item"><label>Bank</label><div class="value">${inv.bankAccount.bankName}</div></div>
                  <div class="detail-item"><label>Account Title</label><div class="value">${inv.bankAccount.accountTitle}</div></div>
                  <div class="detail-item"><label>Account Number</label><div class="value text-mono">${inv.bankAccount.accountNumber}</div></div>
                  <div class="detail-item"><label>IBAN</label><div class="value text-mono">${inv.bankAccount.iban || 'â€”'}</div></div>
                </div>
              ` : ''}
            ` : `
              <div class="flex gap-3">
                <button class="btn btn-primary" data-action="accept-invitation" data-inv-id="${inv.id}">
                  ${icon('check')} Accept &amp; Add Bank Account
                </button>
                <button class="btn btn-secondary" data-action="decline-invitation" data-inv-id="${inv.id}">Decline</button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  supplierTransactions() {
    const txns = getTransactionsForRole('supplier');

    if (!txns.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('repeat')}
            <h3>No financing transactions</h3>
            <p class="mt-2">SCF transactions initiated by your buyer will appear here once disbursed.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Buyer</th>
                <th>Funder</th>
                <th>Amount Financed</th>
                <th>Status</th>
                <th>Disbursed On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${txns.map((t) => `
                <tr>
                  <td class="text-mono font-medium">${t.id}</td>
                  <td>${getCompanyName(t.buyerId)}</td>
                  <td>${getCompanyName(t.funderId)}</td>
                  <td class="font-medium">${formatAmt(t.totalAmount, t.currency)}</td>
                  <td>${statusBadge(t.status)}</td>
                  <td>${formatDate(t.disbursedDate) || 'â€”'}</td>
                  <td><button class="btn btn-ghost btn-sm" data-action="view-transaction" data-txn-id="${t.id}">View â†’</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${txns.filter((t) => t.status === 'disbursed').length ? `
        <div class="callout callout-success mt-6">
          ${icon('check-circle')} <strong>Financing Advice:</strong> Funds disbursed to your registered bank account. Check account ending in â€¦7890.
        </div>
      ` : ''}
    `;
  },

  /* â”€â”€ Funder â€” Transactions & KYC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  funderTransactions() {
    const txns = getTransactionsForRole('funder');

    if (!txns.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('repeat')}
            <h3>No transactions</h3>
            <p class="mt-2">SCF financing requests from your enrolled programs will appear here for review.</p>
          </div>
        </div>
      `;
    }

    return txns.map((txn) => {
      const program = getProgramById(txn.programId);
      const invoices = (txn.invoiceIds || []).map((id) => getInvoiceById(id)).filter(Boolean);
      const canApprove = txn.status === 'submitted';
      const canDisburse = txn.status === 'approved';

      return `
        <div class="card mb-5">
          <div class="card-header">
            <div>
              <h4>${txn.id} â€” ${getCompanyName(txn.supplierId)}</h4>
              <p class="text-sm text-secondary">Buyer: ${getCompanyName(txn.buyerId)} Â· Program: ${program?.name || txn.programId}</p>
            </div>
            <div class="flex gap-3 items-center">
              ${statusBadge(txn.status)}
            </div>
          </div>
          <div class="card-body">
            <div class="detail-grid mb-5">
              <div class="detail-item"><label>Total Amount</label><div class="value large">${formatAmt(txn.totalAmount, txn.currency)}</div></div>
              <div class="detail-item"><label>Discount Rate</label><div class="value">${txn.discountRate}% p.a.</div></div>
              <div class="detail-item"><label>Charges On</label><div class="value" style="text-transform:capitalize">${txn.chargesOn}</div></div>
              <div class="detail-item"><label>Currency</label><div class="value">${txn.currency}</div></div>
              <div class="detail-item"><label>Submitted</label><div class="value">${formatDate(txn.submittedDate)}</div></div>
              <div class="detail-item"><label>Invoices</label><div class="value">${invoices.length} selected</div></div>
            </div>

            <h4 class="mb-3">Invoice Breakdown</h4>
            <table class="data-table mb-5">
              <thead><tr><th>Invoice</th><th>Description</th><th>Amount</th><th>Due Date</th></tr></thead>
              <tbody>
                ${invoices.map((inv) => `
                  <tr>
                    <td class="text-mono">${inv.invoiceNumber}</td>
                    <td class="text-secondary">${inv.description}</td>
                    <td class="font-medium">${formatAmt(inv.amount, inv.currency)}</td>
                    <td>${formatDate(inv.dueDate)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${canApprove ? `
              <div class="callout callout-info mb-4">
                ${icon('shield')} Limit & document verification: All invoices are buyer-approved. Financing within your limit of ${formatAmt(program?.limit || 0, txn.currency)}.
              </div>
              <div class="flex gap-3">
                <button class="btn btn-primary" data-action="funder-approve" data-txn-id="${txn.id}">
                  ${icon('check')} Approve Transaction
                </button>
                <button class="btn btn-secondary" data-action="funder-reject" data-txn-id="${txn.id}">Reject</button>
              </div>
            ` : canDisburse ? `
              <div class="callout callout-success mb-4">
                ${icon('check-circle')} Transaction approved. Ready to disburse funds to ${getCompanyName(txn.supplierId)}.
              </div>
              <button class="btn btn-primary" data-action="funder-disburse" data-txn-id="${txn.id}">
                ${icon('send')} Disburse ${formatAmt(txn.totalAmount, txn.currency)} â†’ ${getCompanyName(txn.supplierId)}
              </button>
            ` : txn.status === 'disbursed' || txn.status === 'repaying' || txn.status === 'closed' ? `
              <div class="callout callout-success">
                ${icon('check-circle')} Funds disbursed on ${formatDate(txn.disbursedDate)}. Awaiting buyer repayment at invoice maturity.
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  funderKyc() {
    const invitations = getInvitationsForRole('funder');
    const funder = getParty('funder');
    const bankData = getData().banks.find((b) => b.id === funder.id) || {};

    if (!invitations.length) {
      return `
        <div class="card">
          <div class="empty-state">
            ${icon('shield')}
            <h3>No onboarding invitations</h3>
            <p class="mt-2">Program invitations from buyers will appear here for KYC and activation.</p>
          </div>
        </div>
      `;
    }

    return invitations.map((inv) => {
      const program = getProgramById(inv.programId);
      const isActivated = inv.status === 'accepted' && inv.kycStatus === 'approved';

      return `
        <div class="card mb-5">
          <div class="card-header">
            <div>
              <h4>${icon('shield')} KYC &amp; Onboarding â€” ${program?.name || inv.programId}</h4>
              <p class="text-sm text-secondary">Invited by ${getCompanyName(program?.buyerId || '')} Â· ${formatDate(inv.sentDate)}</p>
            </div>
            ${statusBadge(inv.status)}
          </div>
          <div class="card-body">
            <p class="text-secondary mb-4">${inv.message}</p>

            <div class="detail-grid mb-5">
              <div class="detail-item"><label>Program</label><div class="value">${program?.name}</div></div>
              <div class="detail-item"><label>Buyer</label><div class="value">${getCompanyName(program?.buyerId || '')}</div></div>
              <div class="detail-item"><label>Currency</label><div class="value">${program?.currency}</div></div>
              <div class="detail-item"><label>Program Limit</label><div class="value">${formatAmt(program?.limit || 0, program?.currency)}</div></div>
              <div class="detail-item"><label>Agreed Rate</label><div class="value">${program?.discountRate}% p.a.</div></div>
              <div class="detail-item"><label>Recourse</label><div class="value">${(program?.recourse || 'without_recourse').replace(/_/g, ' ')}</div></div>
            </div>

            ${isActivated ? `
              <div class="callout callout-success mb-5">
                ${icon('check-circle')} KYC approved. Your financing limit and pricing are active.
              </div>
              <div class="detail-grid mb-4">
                <div class="detail-item"><label>KYC Status</label><div class="value">${statusBadge('kyc_approved')}</div></div>
                <div class="detail-item"><label>Your Financing Limit</label><div class="value large">${formatAmt(inv.financingLimit || 0, program?.currency)}</div></div>
                <div class="detail-item"><label>Your Agreed Rate</label><div class="value">${inv.agreedRate}% p.a.</div></div>
                <div class="detail-item"><label>Activated On</label><div class="value">${formatDate(inv.acceptedDate)}</div></div>
              </div>
              <div class="callout callout-info">
                ${icon('shield')} Program status: ${statusBadge(program?.status)} â€” You are now authorized to receive and fund financing requests.
              </div>
            ` : `
              <div class="callout callout-info mb-5">
                ${icon('shield')} Complete your KYC review and set your financing limit to activate this program.
              </div>
              <form id="kyc-form" class="add-supplier-form">
                <div class="card mb-4" style="border:1px solid var(--color-border)">
                  <div class="card-header"><h4>KYC Documents</h4></div>
                  <div class="card-body">
                    <div class="kyc-checklist">
                      ${['Certificate of Incorporation', 'Bank License / SBP Authorization', 'AML / CFT Policy Document', 'Authorized Signatory List', 'Audited Financial Statements'].map((doc) => `
                        <div class="kyc-item">
                          <span class="kyc-check">${icon('check')}</span>
                          <span>${doc}</span>
                          <span class="badge badge-approved" style="margin-left:auto">Verified</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
                <div class="card mb-4" style="border:1px solid var(--color-border)">
                  <div class="card-header"><h4>Set Financing Limit &amp; Agreed Pricing</h4></div>
                  <div class="card-body">
                    <div class="form-grid">
                      <div class="form-group">
                        <label class="form-label">Financing Limit (${program?.currency})</label>
                        <input class="form-input" name="financingLimit" type="number" value="${inv.financingLimit || bankData.financingLimit || '30000000'}" required />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Agreed Discount Rate (% p.a.)</label>
                        <input class="form-input" name="agreedRate" type="number" step="0.01" value="${inv.agreedRate || bankData.agreedRate || program?.discountRate || '18.5'}" required />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary btn-lg" data-inv-id="${inv.id}">${icon('shield')} Complete KYC &amp; Activate</button>
                </div>
              </form>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  /* â”€â”€ Shared â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
            <p class="text-sm text-secondary">${programTypeLabel(p.type)} Â· ${statusBadge(p.status)} Â· ${p.id}</p>
          </div>
          ${role === 'buyer' ? `
            <div class="flex gap-2">
              <a href="#/buyer/add-supplier" class="btn btn-secondary btn-sm">${icon('user-plus')} Supplier</a>
              ${p.type !== 'dynamic_discounting' ? `<a href="#/buyer/add-bank" class="btn btn-secondary btn-sm">${icon('landmark')} Bank</a>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="callout callout-info mb-4" style="margin-top: var(--space-4);">
          <strong>Buyer:</strong> ${buyerName} (${p.buyerId}) â€” one program, one buyer
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
              <div class="program-party-chip">${s.id} Â· ${s.name}</div>
            `).join('') : '<span class="text-sm text-muted">None</span>'}
          </div>
          <div class="program-party-col">
            <h5 class="text-xs font-semibold text-secondary mb-2">ENROLLED BANKS</h5>
            ${funders.length ? funders.map((b) => `
              <div class="program-party-chip">${b.id} Â· ${b.name}</div>
            `).join('') : `<span class="text-sm text-muted">${p.type === 'dynamic_discounting' ? 'Buyer-funded (no bank)' : 'None'}</span>`}
          </div>
        </div>
      </div>
    `}).join('');
  },

  supplierTransactionDetail(txn) {
    const program = getProgramById(txn.programId);
    const invoices = (txn.invoiceIds || []).map((id) => getInvoiceById(id)).filter(Boolean);

    return `
      <div class="detail-grid mb-5">
        <div class="detail-item"><label>Transaction ID</label><div class="value text-mono">${txn.id}</div></div>
        <div class="detail-item"><label>Status</label><div class="value">${statusBadge(txn.status)}</div></div>
        <div class="detail-item"><label>Program</label><div class="value">${program?.name || txn.programId}</div></div>
        <div class="detail-item"><label>Amount Financed</label><div class="value large">${formatAmt(txn.totalAmount, txn.currency)}</div></div>
        <div class="detail-item"><label>Buyer</label><div class="value">${getCompanyName(txn.buyerId)}</div></div>
        <div class="detail-item"><label>Funder</label><div class="value">${getCompanyName(txn.funderId)}</div></div>
        <div class="detail-item"><label>Discount Rate</label><div class="value">${txn.discountRate}% p.a.</div></div>
        <div class="detail-item"><label>Submitted</label><div class="value">${formatDate(txn.submittedDate)}</div></div>
        ${txn.disbursedDate ? `<div class="detail-item"><label>Disbursed On</label><div class="value">${formatDate(txn.disbursedDate)}</div></div>` : ''}
      </div>
      <h4 class="mb-4">Invoices</h4>
      <table class="data-table mb-6">
        <thead><tr><th>Invoice #</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>
          ${invoices.map((inv) => `
            <tr>
              <td class="text-mono">${inv.invoiceNumber}</td>
              <td class="text-secondary">${inv.description}</td>
              <td class="font-medium">${formatAmt(inv.amount, inv.currency)}</td>
              <td>${formatDate(inv.dueDate)}</td>
              <td>${statusBadge(txn.repaymentStatus?.[inv.id] === 'repaid' ? 'paid' : inv.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h4 class="mb-4">Progress</h4>
      <div class="flow-timeline">
        ${(txn.timeline || []).map((stage, idx) => {
          const isActive = !stage.completed && (idx === 0 || txn.timeline[idx - 1]?.completed);
          return `
            <div class="flow-step ${stage.completed ? 'completed' : isActive ? 'active' : ''}">
              <div class="flow-dot"></div>
              <div class="flow-content">
                <div class="flow-title">${stage.stage}</div>
                <div class="flow-date">${stage.date ? formatDate(stage.date) : '—'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  transactionDetail(txn) {
    const program = getProgramById(txn.programId);
    const invoices = (txn.invoiceIds || []).map((id) => getInvoiceById(id)).filter(Boolean);

    return `
      <div class="detail-grid mb-5">
        <div class="detail-item"><label>Transaction ID</label><div class="value text-mono">${txn.id}</div></div>
        <div class="detail-item"><label>Status</label><div class="value">${statusBadge(txn.status)}</div></div>
        <div class="detail-item"><label>Program</label><div class="value">${program?.name || txn.programId}</div></div>
        <div class="detail-item"><label>Total Amount</label><div class="value large">${formatAmt(txn.totalAmount, txn.currency)}</div></div>
        <div class="detail-item"><label>Buyer</label><div class="value">${getCompanyName(txn.buyerId)}</div></div>
        <div class="detail-item"><label>Supplier</label><div class="value">${getCompanyName(txn.supplierId)}</div></div>
        <div class="detail-item"><label>Funder</label><div class="value">${getCompanyName(txn.funderId)}</div></div>
        <div class="detail-item"><label>Charges On</label><div class="value" style="text-transform:capitalize">${txn.chargesOn}</div></div>
      </div>
      <h4 class="mb-4">Invoices</h4>
      <table class="data-table mb-6">
        <thead><tr><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>
          ${invoices.map((inv) => `
            <tr>
              <td class="text-mono">${inv.invoiceNumber}</td>
              <td class="font-medium">${formatAmt(inv.amount, inv.currency)}</td>
              <td>${formatDate(inv.dueDate)}</td>
              <td>${statusBadge(txn.repaymentStatus?.[inv.id] === 'repaid' ? 'paid' : inv.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h4 class="mb-4">Flow Timeline</h4>
      <div class="flow-timeline">
        ${(txn.timeline || []).map((stage, idx) => {
          const isActive = !stage.completed && (idx === 0 || txn.timeline[idx - 1]?.completed);
          return `
            <div class="flow-step ${stage.completed ? 'completed' : isActive ? 'active' : ''}">
              <div class="flow-dot"></div>
              <div class="flow-content">
                <div class="flow-title">${stage.stage}</div>
                <div class="flow-date">${stage.date ? formatDate(stage.date) : 'â€”'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
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
            <div class="timeline-step-date">${s.date ? formatDate(s.date) : 'â€”'}</div>
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
