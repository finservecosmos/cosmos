import { useState, useEffect } from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import Modal from '../shared/ui/Modal';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { useClientForm } from '../features/client-onboarding/hooks/useClientForm';
import ClientOnboardingWizard from '../features/client-onboarding/components/ClientOnboardingWizard';
import ClientRecordsTable from '../features/client-onboarding/components/ClientRecordsTable';
import ClientOnboardingForm from '../features/client-onboarding/components/ClientOnboardingForm';
import '../shared/ui/DataPage.css';
import { Users, RefreshCw, CheckCircle, Banknote, Folder, Hourglass, FileText } from 'lucide-react';

function maskAadhaar(num) {
  if (!num) return '';
  const clean = num.toString().replace(/\s+/g, '');
  if (clean.length < 12) return num;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

function maskPAN(pan) {
  if (!pan) return '';
  const clean = pan.toString().toUpperCase().trim();
  if (clean.length < 10) return pan;
  return `${clean.slice(0, 5)}••••${clean.slice(-1)}`;
}

const statusClass = (s) => 'status-badge status-' + String(s || '').toLowerCase().replace(' ', '-');

function formatAmount(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const LOAN_TYPES = ['All', 'Home Loan', 'Business Loan', 'Personal Loan', 'Gold Loan', 'Mortgage'];
const STATUSES = ['All', 'Enquiry', 'Processing', 'Approved', 'Disbursed', 'Closed'];

export default function ClientRecordBook() {
  const { clients, addClient, updateClient } = useAppState();
  const { addToast } = useToast();
  const { user } = useUser();

  const [search, setSearch] = useState('');
  const [loanFilter, setLoan] = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const clientFormState = useClientForm({
    addClient,
    updateClient,
    addToast,
    currentUser: user
  });

  const {
    formData,
    modalOpen,
    setModalOpen,
    modalMode,
    revealAadhaar,
    setRevealAadhaar,
    revealPAN,
    setRevealPAN,
    validationErrors,
    setValidationErrors,
    showAddWizard,
    clientDocs,
    uploadProgress,
    openAddModal,
    openEditModal,
    openViewModal,
    saveClient,
    handleDocumentUpload
  } = clientFormState;

  useEffect(() => {
    document.title = 'Client Record Book | Cosmos';
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, loanFilter, statusFilter]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || String(c.name || '').toLowerCase().includes(q) || String(c.phone || '').includes(q);
    const matchLoan = loanFilter === 'All' || c.loan_type === loanFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchLoan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedClients = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalDisbursed = clients
    .filter(c => ['Approved', 'Disbursed'].includes(c.status))
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);

  if (showAddWizard) {
    return (
      <ClientOnboardingWizard
        clientFormState={clientFormState}
        LOAN_TYPES={LOAN_TYPES}
        STATUSES={STATUSES}
        maskPAN={maskPAN}
        maskAadhaar={maskAadhaar}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="data-page">
        {/* Header */}
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Client Record Book</h2>
            <p className="data-page-sub">{clients.length} total clients</p>
          </div>
        </div>

        {/* Summary Card Metrics */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Clients</div>
              <div className="kpi-value">{clients.length}</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#d97706', background: '#fef3c7' }}>
                <RefreshCw size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Active Files</div>
              <div className="kpi-value">{clients.filter(c => c.status === 'Processing').length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Approved</div>
              <div className="kpi-value">{clients.filter(c => c.status === 'Approved').length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#8b5cf6', background: '#ede9fe' }}>
                <Banknote size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Disbursed</div>
              <div className="kpi-value">{formatAmount(totalDisbursed)}</div>
            </div>
          </div>
        </div>

        {/* Clients list grid table */}
        <ClientRecordsTable
          paginatedClients={paginatedClients}
          search={search}
          setSearch={setSearch}
          loanFilter={loanFilter}
          setLoan={setLoan}
          statusFilter={statusFilter}
          setStatus={setStatus}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          filteredCount={filtered.length}
          LOAN_TYPES={LOAN_TYPES}
          STATUSES={STATUSES}
          formatAmount={formatAmount}
          statusClass={statusClass}
          openViewModal={openViewModal}
          openEditModal={openEditModal}
        />

        {modalOpen && (
          <Modal title={modalMode === 'view' ? 'Client details' : modalMode === 'edit' ? 'Edit client' : 'Add client'} onClose={() => setModalOpen(false)}>
            <ClientOnboardingForm
              formData={formData}
              setFormData={clientFormState.setFormData}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
              mode="modal"
              modalMode={modalMode}
              revealPAN={revealPAN}
              setRevealPAN={setRevealPAN}
              revealAadhaar={revealAadhaar}
              setRevealAadhaar={setRevealAadhaar}
              currentUser={user}
              addToast={addToast}
              maskPAN={maskPAN}
              maskAadhaar={maskAadhaar}
              LOAN_TYPES={LOAN_TYPES}
              STATUSES={STATUSES}
            />



            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveClient}>Save</button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
