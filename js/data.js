let _data = null;
let _demoIds = null;
let _state = {};

async function loadData() {
  if (_data) return _data;
  const cacheBust = Date.now();
  const [scfRes, idsRes] = await Promise.all([
    fetch(`data/scf-data.json?v=${cacheBust}`),
    fetch(`data/demo-ids.json?v=${cacheBust}`),
  ]);
  _data = await scfRes.json();
  _demoIds = await idsRes.json();
  syncSupplierProgramRefs();
  return _data;
}

/** Keep supplier.enrolledPrograms in sync with program.enrolledSupplierIds */
function syncSupplierProgramRefs() {
  _data.suppliers.forEach((s) => {
    s.enrolledPrograms = _data.programs
      .filter((p) => p.enrolledSupplierIds?.includes(s.id))
      .map((p) => p.id);
  });
}

function getDemoIds() {
  return _demoIds;
}

function getEntityById(id) {
  if (!_demoIds) return null;
  const all = [
    ..._demoIds.suppliers,
    ..._demoIds.buyers,
    ..._demoIds.banks,
  ];
  return all.find((e) => e.id === id) || null;
}

function getCompanyName(id) {
  const fromRegistry = _data?.suppliers.find((s) => s.id === id)?.name
    || _data?.banks.find((b) => b.id === id)?.name
    || getPartyById(id)?.name;
  if (fromRegistry) return fromRegistry;
  const entity = getEntityById(id);
  if (entity) return entity.companyName;
  return _demoIds?.lookup?.[id]?.label || id;
}

function getSupplierName(supplierId) {
  return getCompanyName(supplierId);
}

function getBanks() {
  return _data?.banks || _demoIds?.banks || [];
}

function getData() {
  return _data;
}

function getState() {
  return _state;
}

function setState(updates) {
  _state = { ..._state, ...updates };
}

function setActiveEntity(role, entityId) {
  const ids = getDemoIds();
  if (!ids) return;

  if (role === 'supplier') {
    const e = ids.suppliers.find((s) => s.id === entityId);
    if (!e) return;
    _data.parties.supplier = {
      id: e.id,
      name: e.companyName,
      role: 'supplier',
      country: e.country,
      contact: e.pocName,
      designation: e.designation,
      email: e.email,
    };
  } else if (role === 'buyer') {
    const e = ids.buyers.find((b) => b.id === entityId);
    if (!e) return;
    _data.parties.buyer = {
      id: e.id,
      name: e.companyName,
      role: 'buyer',
      country: e.country,
      contact: e.pocName,
      designation: e.designation,
      email: e.email,
    };
  } else if (role === 'funder') {
    const e = ids.banks.find((b) => b.id === entityId);
    if (!e) return;
    _data.parties.funder = {
      id: e.id,
      name: e.companyName,
      role: 'funder',
      country: e.country,
      type: 'Bank',
      contact: e.pocName,
      designation: e.designation,
      email: e.email,
    };
  }

  setState({ role, entityId });
}

function getAllDemoEntities() {
  const ids = getDemoIds();
  if (!ids) return { suppliers: [], buyers: [], banks: [] };
  return {
    suppliers: ids.suppliers || [],
    buyers: ids.buyers || [],
    banks: ids.banks || [],
  };
}

function getParty(role) {
  return _data.parties[role];
}

function getPartyById(id) {
  if (_data.parties.supplier?.id === id) return _data.parties.supplier;
  if (_data.parties.buyer?.id === id) return _data.parties.buyer;
  if (_data.parties.funder?.id === id) return _data.parties.funder;
  return _data.banks.find((b) => b.id === id) || null;
}

function getProgramById(id) {
  return _data.programs.find((p) => p.id === id);
}

function getBuyerForProgram(programId) {
  const program = getProgramById(programId);
  if (!program) return null;
  return getCompanyName(program.buyerId);
}

function getProgramsForBuyer(buyerId) {
  return _data.programs.filter((p) => p.buyerId === buyerId);
}

function getProgramsForRole(role) {
  const party = _data.parties[role];
  if (role === 'buyer') {
    return getProgramsForBuyer(party.id);
  }
  if (role === 'funder') {
    return _data.programs.filter((p) => p.enrolledFunderIds?.includes(party.id));
  }
  if (role === 'supplier') {
    return _data.programs.filter((p) => p.enrolledSupplierIds?.includes(party.id));
  }
  return _data.programs;
}

function getSuppliersForProgram(programId) {
  const program = getProgramById(programId);
  if (!program) return [];
  return _data.suppliers.filter((s) => program.enrolledSupplierIds?.includes(s.id));
}

function getFundersForProgram(programId) {
  const program = getProgramById(programId);
  if (!program) return [];
  return _data.banks.filter((b) => program.enrolledFunderIds?.includes(b.id));
}

function getSuppliersForBuyer(buyerId) {
  const programIds = new Set(
    getProgramsForBuyer(buyerId).flatMap((p) => p.enrolledSupplierIds || [])
  );
  return _data.suppliers.filter((s) => programIds.has(s.id));
}

function getInvoicesForRole(role) {
  const party = _data.parties[role];
  if (role === 'supplier') {
    return _data.invoices.filter((i) => i.supplierId === party.id);
  }
  if (role === 'buyer') {
    return _data.invoices.filter((i) => i.buyerId === party.id);
  }
  if (role === 'funder') {
    const programIds = getProgramsForRole('funder').map((p) => p.id);
    return _data.invoices.filter((i) => programIds.includes(i.programId));
  }
  return _data.invoices;
}

function getInvoiceById(id) {
  return _data.invoices.find((i) => i.id === id);
}

function getActivitiesForRole(role) {
  return _data.activities
    .filter((a) => a.roles.includes(role))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getFundingOpportunities() {
  const { role } = getState();
  if (role === 'funder') {
    const programIds = getProgramsForRole('funder').map((p) => p.id);
    return _data.fundingOpportunities.filter((o) => programIds.includes(o.programId));
  }
  return _data.fundingOpportunities;
}

function getSuppliers() {
  const { role } = getState();
  if (role === 'buyer') {
    return getSuppliersForBuyer(getParty('buyer').id);
  }
  return _data.suppliers;
}

function getNextSupplierId() {
  const nums = _data.suppliers.map((s) => parseInt(s.id.replace('SUP-', ''), 10));
  const next = Math.max(...nums, 0) + 1;
  return `SUP-${String(next).padStart(3, '0')}`;
}

function enrollSupplierInProgram(supplierId, programId) {
  const program = getProgramById(programId);
  if (!program) return false;
  if (!program.enrolledSupplierIds) program.enrolledSupplierIds = [];
  if (!program.enrolledSupplierIds.includes(supplierId)) {
    program.enrolledSupplierIds.push(supplierId);
  }
  const supplier = _data.suppliers.find((s) => s.id === supplierId);
  if (supplier) {
    if (!supplier.enrolledPrograms) supplier.enrolledPrograms = [];
    if (!supplier.enrolledPrograms.includes(programId)) {
      supplier.enrolledPrograms.push(programId);
    }
  }
  return true;
}

function enrollFunderInProgram(bankId, programId) {
  const program = getProgramById(programId);
  if (!program) return false;
  if (!program.enrolledFunderIds) program.enrolledFunderIds = [];
  if (program.enrolledFunderIds.includes(bankId)) return false;
  program.enrolledFunderIds.push(bankId);

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'bank_enrolled',
    title: `${getCompanyName(bankId)} enrolled in ${program.name}`,
    party: getParty('buyer')?.name || 'Buyer',
    timestamp: new Date().toISOString(),
    roles: ['buyer', 'funder'],
  });
  return true;
}

function addSupplier(payload) {
  const programId = payload.programId;
  const program = getProgramById(programId);
  if (!program) throw new Error('Program not found');

  const id = getNextSupplierId();
  const supplier = {
    id,
    name: payload.companyName,
    pocName: payload.pocName,
    designation: payload.designation,
    email: payload.email,
    phone: payload.phone || '',
    ntn: payload.ntn || '',
    city: payload.city || '',
    industry: payload.industry || '',
    country: 'Pakistan',
    status: 'pending',
    enrolledPrograms: [programId],
    totalInvoiced: 0,
    totalFunded: 0,
    avgPaymentDays: payload.paymentTerms || 60,
    riskRating: payload.riskRating || 'medium',
    notes: payload.notes || '',
    addedBy: getParty('buyer')?.contact || '',
    addedDate: new Date().toISOString().split('T')[0],
  };

  _data.suppliers.push(supplier);
  enrollSupplierInProgram(id, programId);

  if (_demoIds) {
    _demoIds.suppliers.push({
      id,
      type: 'Supplier',
      companyName: payload.companyName,
      pocName: payload.pocName,
      designation: payload.designation,
      email: payload.email,
      country: 'Pakistan',
      status: 'pending',
    });
    _demoIds.lookup[id] = { entityType: 'supplier', label: payload.companyName };
  }

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'supplier_added',
    title: `Supplier ${payload.companyName} (${id}) added to ${program.name}`,
    party: getParty('buyer')?.name || 'Buyer',
    timestamp: new Date().toISOString(),
    roles: ['buyer'],
  });

  return supplier;
}

function addBankToProgram(payload) {
  const { programId, bankId } = payload;
  const program = getProgramById(programId);
  const bank = _data.banks.find((b) => b.id === bankId);
  if (!program || !bank) throw new Error('Program or bank not found');
  if (program.type === 'dynamic_discounting') {
    throw new Error('Dynamic discounting programs are buyer-funded — banks cannot be enrolled');
  }
  enrollFunderInProgram(bankId, programId);
  return bank;
}

function getAvailableBanksForProgram(programId) {
  const program = getProgramById(programId);
  if (!program) return [];
  const enrolled = new Set(program.enrolledFunderIds || []);
  return _data.banks.filter((b) => !enrolled.has(b.id));
}

function getAvailableSuppliersForProgram(programId) {
  const program = getProgramById(programId);
  if (!program) return [];
  const enrolled = new Set(program.enrolledSupplierIds || []);
  return _data.suppliers.filter((s) => !enrolled.has(s.id));
}

function removeSupplierFromProgram(supplierId, programId) {
  const program = getProgramById(programId);
  if (!program) return false;
  program.enrolledSupplierIds = (program.enrolledSupplierIds || []).filter((id) => id !== supplierId);
  const supplier = _data.suppliers.find((s) => s.id === supplierId);
  if (supplier?.enrolledPrograms) {
    supplier.enrolledPrograms = supplier.enrolledPrograms.filter((id) => id !== programId);
  }
  syncSupplierProgramMembership();
  return true;
}

function removeFunderFromProgram(bankId, programId) {
  const program = getProgramById(programId);
  if (!program) return false;
  program.enrolledFunderIds = (program.enrolledFunderIds || []).filter((id) => id !== bankId);
  return true;
}

function updateSupplierDetails(supplierId, payload) {
  const supplier = _data.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return null;
  if (payload.companyName !== undefined) supplier.name = payload.companyName;
  if (payload.pocName !== undefined) supplier.pocName = payload.pocName;
  if (payload.designation !== undefined) supplier.designation = payload.designation;
  if (payload.email !== undefined) supplier.email = payload.email;
  if (payload.phone !== undefined) supplier.phone = payload.phone;
  if (payload.status !== undefined) supplier.status = payload.status;
  if (_demoIds) {
    const demo = _demoIds.suppliers.find((s) => s.id === supplierId);
    if (demo) {
      if (payload.companyName !== undefined) demo.companyName = payload.companyName;
      if (payload.pocName !== undefined) demo.pocName = payload.pocName;
      if (payload.designation !== undefined) demo.designation = payload.designation;
      if (payload.email !== undefined) demo.email = payload.email;
      if (payload.status !== undefined) demo.status = payload.status;
    }
  }
  return supplier;
}

function getFunderInviteForProgram(bankId, programId) {
  return (_data.invitations || []).find(
    (i) => i.entityId === bankId && i.programId === programId && i.type === 'funder'
  );
}

function updateFunderProgramDetails(bankId, programId, payload) {
  const bank = _data.banks.find((b) => b.id === bankId);
  if (!bank) return null;
  if (payload.pocName !== undefined) bank.pocName = payload.pocName;
  if (payload.designation !== undefined) bank.designation = payload.designation;
  if (payload.agreedRate !== undefined) bank.agreedRate = payload.agreedRate;
  if (payload.financingLimit !== undefined) bank.financingLimit = payload.financingLimit;
  const invite = getFunderInviteForProgram(bankId, programId);
  if (invite) {
    if (payload.agreedRate !== undefined) invite.agreedRate = payload.agreedRate;
    if (payload.financingLimit !== undefined) invite.financingLimit = payload.financingLimit;
  }
  return bank;
}

function enrollExistingSupplierInProgram(supplierId, programId) {
  const supplier = _data.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return false;
  enrollSupplierInProgram(supplierId, programId);
  return supplier;
}

function updateInvoiceStatus(invoiceId, updates) {
  const inv = getInvoiceById(invoiceId);
  if (inv) Object.assign(inv, updates);
}

function updateOpportunityStatus(oppId, status) {
  const opp = _data.fundingOpportunities.find((o) => o.id === oppId);
  if (opp) opp.status = status;
}

function computeSupplierStats(invoices) {
  const approved = invoices.filter((i) => ['approved', 'funded', 'paid'].includes(i.status));
  const availableForFunding = invoices.filter(
    (i) => i.status === 'approved' && !i.fundingStatus
  );
  const pending = invoices.filter((i) => i.status === 'pending');
  const totalOutstanding = approved
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + i.amount, 0);
  const totalAvailable = availableForFunding.reduce((s, i) => s + i.amount, 0);
  const totalFunded = invoices
    .filter((i) => i.fundingStatus === 'disbursed' || i.status === 'funded')
    .reduce((s, i) => s + (i.fundedAmount || i.amount), 0);

  return { totalOutstanding, totalAvailable, totalFunded, pendingCount: pending.length, availableCount: availableForFunding.length };
}

function computeBuyerStats(invoices) {
  const pendingApproval = invoices.filter((i) => i.status === 'pending');
  const approved = invoices.filter((i) => ['approved', 'funded', 'paid'].includes(i.status));
  const totalPayables = approved.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const programs = getProgramsForRole('buyer');
  const totalLimit = programs.reduce((s, p) => s + p.limit, 0);
  const totalUtilized = programs.reduce((s, p) => s + p.utilized, 0);
  const buyerId = getParty('buyer').id;

  return {
    pendingCount: pendingApproval.length,
    pendingAmount: pendingApproval.reduce((s, i) => s + i.amount, 0),
    totalPayables,
    programUtilization: pct(totalUtilized, totalLimit),
    supplierCount: getSuppliersForBuyer(buyerId).length,
    programCount: programs.length,
  };
}

/* ── SCF Transactions ─────────────────────────────────────────── */

function getTransactions() {
  return _data.transactions || [];
}

function getTransactionById(id) {
  return getTransactions().find((t) => t.id === id) || null;
}

function getTransactionsForRole(role) {
  const party = _data.parties[role];
  const txns = getTransactions();
  if (role === 'buyer') return txns.filter((t) => t.buyerId === party.id);
  if (role === 'supplier') return txns.filter((t) => t.supplierId === party.id);
  if (role === 'funder') return txns.filter((t) => t.funderId === party.id);
  return txns;
}

function updateTransactionStatus(id, updates) {
  const txn = getTransactionById(id);
  if (txn) Object.assign(txn, updates);
}

function updateTransactionTimeline(id, stageIndex, date) {
  const txn = getTransactionById(id);
  if (txn && txn.timeline && txn.timeline[stageIndex]) {
    txn.timeline[stageIndex].completed = true;
    txn.timeline[stageIndex].date = date;
  }
}

function createSCFTransaction(payload) {
  const id = `TXN-${String(getTransactions().length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().split('T')[0];
  const program = getProgramById(payload.programId);

  const repaymentStatus = {};
  (payload.invoiceIds || []).forEach((invId) => { repaymentStatus[invId] = 'pending'; });

  const txn = {
    id,
    programId: payload.programId,
    buyerId: payload.buyerId,
    supplierId: payload.supplierId,
    funderId: payload.funderId,
    invoiceIds: payload.invoiceIds || [],
    totalAmount: payload.totalAmount,
    currency: program?.currency || 'PKR',
    discountRate: program?.discountRate || 18.5,
    chargesOn: program?.chargesOn || 'buyer',
    status: 'submitted',
    createdDate: now,
    submittedDate: now,
    approvedDate: null,
    disbursedDate: null,
    closedDate: null,
    repaymentStatus,
    timeline: [
      { stage: 'Program Created', date: program?.startDate || now, completed: true },
      { stage: 'Supplier Invited', date: now, completed: true },
      { stage: 'Funder Onboarded', date: now, completed: true },
      { stage: 'Program Activated', date: program?.activationDate || now, completed: true },
      { stage: 'Transaction Created', date: now, completed: true },
      { stage: 'Funder Approved', date: null, completed: false },
      { stage: 'Funds Disbursed', date: null, completed: false },
      { stage: 'Repaying', date: null, completed: false },
      { stage: 'Transaction Closed', date: null, completed: false },
    ],
  };

  _data.transactions.push(txn);

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'transaction_submitted',
    title: `SCF Transaction ${id} submitted — ${formatAmt(payload.totalAmount, txn.currency)}`,
    party: getCompanyName(payload.buyerId),
    timestamp: new Date().toISOString(),
    roles: ['buyer', 'funder', 'supplier'],
  });

  return txn;
}

function addProgram(payload) {
  const id = `PRG-${String(_data.programs.length + 1).padStart(3, '0')}`;
  const program = {
    id,
    name: payload.name,
    buyerId: getParty('buyer').id,
    type: 'reverse_factoring',
    status: 'active',
    limit: 0,
    utilized: 0,
    currency: 'PKR',
    maxTenor: 90,
    discountRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    description: `SCF program for ${getParty('buyer').name}`,
    enrolledSupplierIds: payload.supplierIds || [],
    enrolledFunderIds: payload.funderIds || [],
  };
  _data.programs.push(program);
  syncSupplierProgramRefs();
  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'program_created',
    title: `Program ${program.name} (${id}) created`,
    party: getParty('buyer')?.name || 'Buyer',
    timestamp: new Date().toISOString(),
    roles: ['buyer'],
  });
  return program;
}

function createSCFProgram(payload) {
  const id = `PRG-${String(_data.programs.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().split('T')[0];
  const buyer = getParty('buyer');

  const program = {
    id,
    name: payload.programName,
    buyerId: buyer.id,
    type: payload.programType || 'buyer_initiated_scf',
    status: 'pending',
    limit: parseFloat(payload.programLimit) || 0,
    utilized: 0,
    currency: payload.programCurrency || 'PKR',
    maxTenor: parseInt(payload.programMaxTenor) || 90,
    discountRate: parseFloat(payload.programDiscountRate) || 18.5,
    recourse: payload.programRecourse || 'without_recourse',
    pricing: payload.programPricing || 'agreed',
    chargesOn: payload.programChargesOn || 'buyer',
    startDate: now,
    activationDate: null,
    description: `${programTypeLabel(payload.programType || 'buyer_initiated_scf')} program — ${buyer.name}.`,
    enrolledSupplierIds: payload.supplierInviteId ? [payload.supplierInviteId] : [],
    enrolledFunderIds: payload.funderInviteId ? [payload.funderInviteId] : [],
  };

  _data.programs.push(program);

  if (payload.supplierInviteId) {
    _data.invitations.push({
      id: `INVT-${Date.now()}`,
      programId: id,
      type: 'supplier',
      entityId: payload.supplierInviteId,
      entityName: getCompanyName(payload.supplierInviteId),
      status: 'invited',
      sentDate: now,
      acceptedDate: null,
      message: `You are invited to join the ${program.name} as a supplier.`,
    });
  }

  if (payload.funderInviteId) {
    _data.invitations.push({
      id: `INVT-${Date.now() + 1}`,
      programId: id,
      type: 'funder',
      entityId: payload.funderInviteId,
      entityName: getCompanyName(payload.funderInviteId),
      status: 'invited',
      sentDate: now,
      acceptedDate: null,
      message: `You are invited to fund the ${program.name}.`,
    });
  }

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'program_created',
    title: `SCF Program ${id} created by ${buyer.name}`,
    party: buyer.name,
    timestamp: new Date().toISOString(),
    roles: ['buyer'],
  });

  return program;
}

/* ── Invitations ──────────────────────────────────────────────── */

function getInvitations() {
  return _data.invitations || [];
}

function getInvitationsForRole(role) {
  const party = _data.parties[role];
  if (role === 'supplier') {
    return getInvitations().filter((i) => i.type === 'supplier' && i.entityId === party.id);
  }
  if (role === 'funder') {
    return getInvitations().filter((i) => i.type === 'funder' && i.entityId === party.id);
  }
  if (role === 'buyer') {
    const programIds = getProgramsForRole('buyer').map((p) => p.id);
    return getInvitations().filter((i) => programIds.includes(i.programId));
  }
  return getInvitations();
}

function getInvitationById(id) {
  return getInvitations().find((i) => i.id === id) || null;
}

function acceptSupplierInvitation(id, bankAccount) {
  const inv = getInvitationById(id);
  if (!inv) return;
  const now = new Date().toISOString().split('T')[0];
  inv.status = 'accepted';
  inv.acceptedDate = now;
  inv.bankAccount = bankAccount;

  const supplier = _data.suppliers.find((s) => s.id === inv.entityId);
  if (supplier && !supplier.enrolledPrograms.includes(inv.programId)) {
    supplier.enrolledPrograms.push(inv.programId);
  }

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'invitation_accepted',
    title: `${getCompanyName(inv.entityId)} accepted invitation to ${getProgramById(inv.programId)?.name || inv.programId}`,
    party: getCompanyName(inv.entityId),
    timestamp: new Date().toISOString(),
    roles: ['buyer', 'supplier'],
  });
}

function activateFunderInvitation(id, limitData) {
  const inv = getInvitationById(id);
  if (!inv) return;
  const now = new Date().toISOString().split('T')[0];
  inv.status = 'accepted';
  inv.acceptedDate = now;
  inv.kycStatus = 'approved';
  inv.financingLimit = parseFloat(limitData.financingLimit) || 0;
  inv.agreedRate = parseFloat(limitData.agreedRate) || 18.5;

  const bank = _data.banks.find((b) => b.id === inv.entityId);
  if (bank) {
    bank.kycStatus = 'approved';
    bank.financingLimit = inv.financingLimit;
    bank.agreedRate = inv.agreedRate;
  }

  const program = getProgramById(inv.programId);
  if (program && program.status === 'pending') {
    program.status = 'active';
    program.activationDate = now;
  }

  _data.activities.unshift({
    id: `ACT-${Date.now()}`,
    type: 'program_activated',
    title: `${getCompanyName(inv.entityId)} onboarded — ${program?.name} now active`,
    party: getCompanyName(inv.entityId),
    timestamp: new Date().toISOString(),
    roles: ['buyer', 'funder'],
  });
}

/* ── Repayment ────────────────────────────────────────────────── */

function repayInvoice(txnId, invoiceId) {
  const txn = getTransactionById(txnId);
  if (!txn) return;
  const now = new Date().toISOString().split('T')[0];

  txn.repaymentStatus[invoiceId] = 'repaid';

  const allRepaid = Object.values(txn.repaymentStatus).every((s) => s === 'repaid');
  if (allRepaid && txn.status === 'repaying') {
    txn.status = 'closed';
    txn.closedDate = now;
    const closedStage = txn.timeline.find((t) => t.stage === 'Transaction Closed');
    if (closedStage) { closedStage.completed = true; closedStage.date = now; }
    _data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'settlement',
      title: `Transaction ${txnId} closed — all invoices repaid`,
      party: getCompanyName(txn.buyerId),
      timestamp: new Date().toISOString(),
      roles: ['buyer', 'funder'],
    });
  }

  const inv = getInvoiceById(invoiceId);
  if (inv) inv.status = 'paid';
}

function computeFunderStats() {
  const opportunities = getFundingOpportunities();
  const available = opportunities.filter((o) => o.status === 'available');
  const programs = getProgramsForRole('funder');
  const programIds = programs.map((p) => p.id);
  const portfolio = _data.invoices.filter(
    (i) => programIds.includes(i.programId) && (i.fundingStatus === 'disbursed' || i.status === 'funded')
  );
  const deployed = programs.reduce((s, p) => s + p.utilized, 0);
  const totalYield = opportunities.reduce((s, o) => s + o.expectedYield, 0);

  return {
    availableCount: available.length,
    availableAmount: available.reduce((s, o) => s + o.amount, 0),
    deployed,
    portfolioCount: portfolio.length,
    pendingReview: opportunities.filter((o) => o.status === 'pending_review').length,
    expectedYield: totalYield,
    programCount: programs.length,
  };
}
