const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your supply chain finance activity' },
  invoices: { title: 'Invoices', subtitle: 'View and manage all invoices' },
  'early-payment': { title: 'Early Payment', subtitle: 'Request accelerated payment on approved invoices' },
  programs: { title: 'Programs', subtitle: 'SCF programs you are enrolled in' },
  approvals: { title: 'Approvals', subtitle: 'Review and approve supplier invoices' },
  suppliers: { title: 'Suppliers', subtitle: 'Manage your enrolled supplier network' },
  'add-supplier': { title: 'Add Supplier', subtitle: 'Enroll a supplier into an SCF program' },
  'add-bank': { title: 'Add Bank', subtitle: 'Enroll a bank/funder into an SCF program' },
  opportunities: { title: 'Funding Opportunities', subtitle: 'Review and fund invoice discounting requests' },
  portfolio: { title: 'Portfolio', subtitle: 'Active funded positions and performance' },
};

const VIEW_MAP = {
  supplier: {
    dashboard: () => Views.supplierDashboard(),
    invoices: () => Views.supplierInvoices(),
    'early-payment': () => Views.supplierEarlyPayment(),
    programs: () => Views.supplierPrograms(),
  },
  buyer: {
    dashboard: () => Views.buyerDashboard(),
    approvals: () => Views.buyerApprovals(),
    invoices: () => Views.buyerInvoices(),
    suppliers: () => Views.buyerSuppliers(),
    'add-supplier': () => Views.buyerAddSupplier(),
    'add-bank': () => Views.buyerAddBank(),
    programs: () => Views.buyerPrograms(),
  },
  funder: {
    dashboard: () => Views.funderDashboard(),
    opportunities: () => Views.funderOpportunities(),
    portfolio: () => Views.funderPortfolio(),
    programs: () => Views.funderPrograms(),
  },
};

function parseRoute() {
  const hash = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  if (!parts.length) return { role: null, page: null };
  return { role: parts[0], page: parts[1] || 'dashboard' };
}

function renderShell(role, page, content) {
  const data = getData();
  const party = getParty(role);
  const nav = data.navigation[role];
  const pageInfo = PAGE_TITLES[page] || { title: page, subtitle: '' };

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a href="#/${role}/dashboard" class="sidebar-brand">
          <img src="assets/logo.png" alt="TradeOrigin">
        </a>
        <div class="sidebar-role">
          <div class="sidebar-role-label">Signed in as</div>
          <div class="sidebar-role-name">${party.contact}</div>
          <div class="sidebar-role-company">${party.id} · ${party.name}</div>
          ${party.designation ? `<div class="sidebar-role-company">${party.designation}</div>` : ''}
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-label">Menu</div>
            ${nav.map((item) => `
              <a href="#/${role}/${item.id}" class="nav-item ${page === item.id ? 'active' : ''}">
                ${icon(item.icon)}
                ${item.label}
              </a>
            `).join('')}
          </div>
        </nav>
        <div class="sidebar-footer">
          <button class="switch-role-btn" data-action="switch-role">
            ${icon('refresh')}
            Switch Role
          </button>
        </div>
      </aside>
      <main class="main-content">
        <header class="page-header">
          <div class="page-header-left">
            <h1>${pageInfo.title}</h1>
            <p>${pageInfo.subtitle}</p>
          </div>
          <div class="page-header-actions">
            ${page === 'invoices' && role === 'supplier' ? `
              <button class="btn btn-primary btn-sm" data-action="submit-invoice">${icon('plus')} Submit Invoice</button>
            ` : ''}
            ${role === 'buyer' && page === 'suppliers' ? `
              <a href="#/buyer/add-supplier" class="btn btn-primary btn-sm">${icon('user-plus')} Add Supplier</a>
            ` : ''}
          </div>
        </header>
        <div class="page-body" id="page-content">
          ${content}
        </div>
      </main>
    </div>
  `;
}

function render() {
  const { role, page } = parseRoute();
  const app = document.getElementById('app');

  if (!role) {
    app.innerHTML = Views.landing();
    return;
  }

  const viewFn = VIEW_MAP[role]?.[page];
  if (!viewFn) {
    location.hash = `#/${role}/dashboard`;
    return;
  }

  setState({ role, page });
  const content = viewFn();
  app.innerHTML = renderShell(role, page, content);
  bindEvents();
}

function bindEvents() {
  const { role } = getState();

  document.querySelectorAll('[data-action="enter-as"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveEntity(btn.dataset.role, btn.dataset.entityId);
      location.hash = `#/${btn.dataset.role}/dashboard`;
    });
  });

  document.querySelector('[data-action="switch-role"]')?.addEventListener('click', () => {
    location.hash = '#/';
  });

  document.querySelectorAll('[data-action="request-funding"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      showModal({
        title: 'Confirm Early Payment Request',
        body: `
          <p class="mb-4">You are requesting early payment for invoice <strong>${inv.invoiceNumber}</strong>.</p>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Invoice Amount</label>
              <div class="value">${formatCurrency(inv.amount)}</div>
            </div>
            <div class="detail-item">
              <label>Net Proceeds</label>
              <div class="value" style="color: var(--color-success)">${formatCurrency(inv.discountOffer.netProceeds)}</div>
            </div>
            <div class="detail-item">
              <label>Discount</label>
              <div class="value">−${formatCurrency(inv.discountOffer.discountAmount)}</div>
            </div>
            <div class="detail-item">
              <label>Payment Date</label>
              <div class="value">${formatDate(inv.discountOffer.earlyPaymentDate)}</div>
            </div>
          </div>
        `,
        footer: `
          <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-funding" data-invoice-id="${id}">Confirm Request</button>
        `,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('[data-action="approve"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      const rate = getProgramsForRole('buyer').find((p) => p.id === inv.programId)?.discountRate || 4.25;
      const discountAmount = Math.round(inv.amount * (rate / 100) * (daysUntil(inv.dueDate) / 365) * 100) / 100;

      updateInvoiceStatus(id, {
        status: 'approved',
        approvedDate: new Date().toISOString().split('T')[0],
        approvedBy: getParty('buyer').contact,
        discountOffer: {
          rate,
          earlyPaymentDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          discountAmount,
          netProceeds: inv.amount - discountAmount,
        },
      });
      showToast(`Invoice ${inv.invoiceNumber} approved`);
      render();
    });
  });

  document.querySelectorAll('[data-action="reject"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.invoiceId;
      const inv = getInvoiceById(id);
      updateInvoiceStatus(id, { status: 'rejected' });
      showToast(`Invoice ${inv.invoiceNumber} rejected`, 'error');
      render();
    });
  });

  document.querySelectorAll('[data-action="fund"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const oppId = btn.dataset.oppId;
      const opp = getFundingOpportunities().find((o) => o.id === oppId);
      const inv = getInvoiceById(opp.invoiceId);

      updateOpportunityStatus(oppId, 'funded');
      updateInvoiceStatus(opp.invoiceId, {
        status: 'funded',
        fundingStatus: 'disbursed',
        fundedDate: new Date().toISOString().split('T')[0],
        fundedAmount: inv.discountOffer?.netProceeds || inv.amount - opp.expectedYield,
        funderId: 'BNK-001',
      });
      showToast(`Funded ${formatCurrency(opp.amount)} to ${opp.supplierName}`);
      render();
    });
  });

  document.querySelectorAll('[data-action="decline"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateOpportunityStatus(btn.dataset.oppId, 'declined');
      showToast('Opportunity declined', 'error');
      render();
    });
  });

  document.querySelectorAll('tr[data-invoice-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const inv = getInvoiceById(row.dataset.invoiceId);
      showModal({
        title: `Invoice ${inv.invoiceNumber}`,
        body: Views.invoiceDetail(inv),
        footer: `<button class="btn btn-secondary" data-action="close-modal">Close</button>`,
      });
      bindModalEvents();
    });
  });

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      document.querySelectorAll('#invoice-table tbody tr, .data-table tbody tr[data-status]').forEach((row) => {
        if (filter === 'all' || row.dataset.status === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  document.querySelector('#add-supplier-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const companyName = form.companyName.value.trim();
    const pocName = form.pocName.value.trim();
    const designation = form.designation.value.trim();
    const email = form.email.value.trim();

    if (!companyName || !pocName || !designation || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const programId = form.programId?.value;
    if (!programId) {
      showToast('Select a program to enroll this supplier', 'error');
      return;
    }

    const supplier = addSupplier({
      companyName,
      ntn: form.ntn.value.trim(),
      industry: form.industry.value,
      city: form.city.value.trim(),
      pocName,
      designation,
      email,
      phone: form.phone.value.trim(),
      programId,
      paymentTerms: parseInt(form.paymentTerms.value, 10) || 60,
      riskRating: form.riskRating.value,
      notes: form.notes.value.trim(),
    });

    showToast(`${supplier.name} enrolled in program as ${supplier.id}`);
    location.hash = '#/buyer/suppliers';
  });

  document.querySelector('[data-action="cancel-add-supplier"]')?.addEventListener('click', () => {
    location.hash = '#/buyer/suppliers';
  });

  document.querySelector('#add-bank-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const programId = form.programId.value;
    const bankId = form.bankId.value;
    try {
      const bank = addBankToProgram({ programId, bankId });
      const program = getProgramById(programId);
      showToast(`${bank.name} enrolled in ${program.name}`);
      location.hash = '#/buyer/programs';
    } catch (err) {
      showToast(err.message || 'Could not enroll bank', 'error');
    }
  });

  document.querySelector('[data-action="cancel-add-bank"]')?.addEventListener('click', () => {
    location.hash = '#/buyer/programs';
  });

  document.querySelectorAll('input[name="programId"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const select = document.getElementById('bank-select');
      if (!select || !radio.checked) return;
      const available = getAvailableBanksForProgram(radio.value);
      select.innerHTML = available.length
        ? available.map((b) => `<option value="${b.id}">${b.id} · ${b.name} — ${b.pocName}</option>`).join('')
        : '<option value="">No banks available</option>';
    });
  });

  document.querySelector('[data-action="submit-invoice"]')?.addEventListener('click', () => {
    showModal({
      title: 'Submit New Invoice',
      body: `
        <div class="form-group">
          <label class="form-label">Invoice Number</label>
          <input class="form-input" placeholder="e.g. PC-8900" />
        </div>
        <div class="form-group">
          <label class="form-label">PO Number</label>
          <input class="form-input" placeholder="e.g. MRG-PO-23001" />
        </div>
        <div class="form-group">
          <label class="form-label">Amount (USD)</label>
          <input class="form-input" type="number" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input class="form-input" type="date" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" placeholder="Goods or services description"></textarea>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn btn-primary" data-action="close-modal">Submit</button>
      `,
    });
    bindModalEvents();
  });
}

function bindModalEvents() {
  document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-root').innerHTML = '';
    });
  });

  document.querySelector('[data-action="confirm-funding"]')?.addEventListener('click', (e) => {
    const id = e.target.dataset.invoiceId;
    const inv = getInvoiceById(id);
    updateInvoiceStatus(id, { fundingStatus: 'requested' });

    const existing = getFundingOpportunities().find((o) => o.invoiceId === id);
    if (!existing) {
      getData().fundingOpportunities.push({
        id: `FO-${Date.now()}`,
        invoiceId: id,
        supplierName: getParty('supplier').name,
        buyerName: getParty('buyer').name,
        amount: inv.amount,
        discountRate: inv.discountOffer.rate,
        tenor: daysUntil(inv.dueDate),
        expectedYield: inv.discountOffer.discountAmount,
        programId: inv.programId,
        status: 'available',
        submittedDate: new Date().toISOString().split('T')[0],
      });
    }

    document.getElementById('modal-root').innerHTML = '';
    showToast(`Early payment requested for ${inv.invoiceNumber}`);
    render();
  });
}

async function init() {
  await loadData();
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/';
  render();
}

init();
