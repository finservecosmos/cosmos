import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../widgets/DashboardLayout';
import Modal from '../../shared/ui/Modal';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import useConfirm from '../../shared/lib/useConfirm';
import { useFinanceEntry } from '../../features/client-ledger/hooks/useFinanceEntry';
import FinanceEntryForm from '../../features/client-ledger/components/FinanceEntryForm';
import FinanceEntryTable from '../../features/client-ledger/components/FinanceEntryTable';
import './FinanceEntry.css';

export default function FinanceEntry() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { clients, addClient, updateClient } = useAppState();

  const financeEntryState = useFinanceEntry({
    clients,
    addClient,
    updateClient,
    addToast,
    confirm
  });

  const {
    isFormOpen,
    setIsFormOpen,
    clientName,
    setClientName,
    mobileNumber,
    setMobileNumber,
    emailId,
    setEmailId,
    loanAmount,
    setLoanAmount,
    duration,
    setDuration,
    dueDate,
    setDueDate,
    interestAmount,
    setInterestAmount,
    aadhaarNumber,
    setAadhaarNumber,
    panNumber,
    setPanNumber,
    coApplicantName,
    setCoApplicantName,
    address,
    setAddress,
    coApplicantAadhaar,
    setCoApplicantAadhaar,
    ebNo,
    setEbNo,
    remarks,
    setRemarks,
    editId,
    displayEntryId,
    searchQuery,
    setSearchQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    currentPage,
    setCurrentPage,
    viewRecord,
    setViewRecord,
    totalInvestments,
    activeClients,
    dueThisWeekCount,
    totalInterestPayable,
    paginatedRecords,
    totalPages,
    PAGE_SIZE,
    handleResetForm,
    handleCancel,
    handleSaveEntry,
    handleEditRecord,
    handleDeleteRecord,
    handleExportCSV
  } = financeEntryState;

  useEffect(() => {
    document.title = 'Finance Entry | Cosmos';
  }, []);

  return (
    <DashboardLayout>
      <div className="finance-entry-page">
        {/* Toggle shortcut block */}
        <div className="finance-entry-actions-row">
          <button 
            type="button" 
            className="data-btn data-btn-primary" 
            onClick={() => {
              if (isFormOpen && editId) {
                financeEntryState.setEditId(null);
                handleResetForm();
              } else {
                setIsFormOpen(!isFormOpen);
              }
            }}
          >
            {isFormOpen ? '✕ Close Form' : '+ New Client Entry'}
          </button>
        </div>

        {/* KPI Row */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ +12.5% vs last month</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INVESTMENTS</div>
              <div className="kpi-value">₹{totalInvestments.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">✓ 94% retention rate</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">ACTIVE INVESTMENTS</div>
              <div className="kpi-value">{activeClients.length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="kpi-tag critical">Action required</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">DUE THIS WEEK</div>
              <div className="kpi-value">{dueThisWeekCount}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag muted">Accrued this cycle</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INTEREST PAYABLE</div>
              <div className="kpi-value">₹{totalInterestPayable.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Collapsible Client Form */}
        {isFormOpen && (
          <FinanceEntryForm
            clientName={clientName}
            setClientName={setClientName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            emailId={emailId}
            setEmailId={setEmailId}
            loanAmount={loanAmount}
            setLoanAmount={setLoanAmount}
            duration={duration}
            setDuration={setDuration}
            dueDate={dueDate}
            setDueDate={setDueDate}
            interestAmount={interestAmount}
            setInterestAmount={setInterestAmount}
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            panNumber={panNumber}
            setPanNumber={setPanNumber}
            coApplicantName={coApplicantName}
            setCoApplicantName={setCoApplicantName}
            address={address}
            setAddress={setAddress}
            coApplicantAadhaar={coApplicantAadhaar}
            setCoApplicantAadhaar={setCoApplicantAadhaar}
            ebNo={ebNo}
            setEbNo={setEbNo}
            remarks={remarks}
            setRemarks={setRemarks}
            editId={editId}
            displayEntryId={displayEntryId}
            handleCancel={handleCancel}
            handleResetForm={handleResetForm}
            handleSaveEntry={handleSaveEntry}
          />
        )}

        {/* Client Records Table Panel */}
        <FinanceEntryTable
          paginatedRecords={paginatedRecords}
          filteredRecordsCount={financeEntryState.filteredRecords.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          PAGE_SIZE={PAGE_SIZE}
          handleExportCSV={handleExportCSV}
          handleEditRecord={handleEditRecord}
          handleDeleteRecord={handleDeleteRecord}
          setViewRecord={setViewRecord}
        />

        {/* View Details Modal */}
        {viewRecord && (
          <Modal title="Finance Record Details" onClose={() => setViewRecord(null)} size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Client Name:</span>
                <span style={{ fontWeight: 700 }}>{viewRecord.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Email ID:</span>
                <span>{viewRecord.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Principal Amount:</span>
                <span className="cell-amount">₹{viewRecord.principal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Interest Payable:</span>
                <span className="cell-amount">₹{viewRecord.interest.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Payable:</span>
                <span className="cell-amount" style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{viewRecord.total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>PAN Card:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.pan_card || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Aadhaar Number:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.aadhaar_number || '—'}</span>
              </div>
              {viewRecord.originalClient.co_applicant_name && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Co-Applicant:</span>
                    <span style={{ fontWeight: 600 }}>{viewRecord.originalClient.co_applicant_name}</span>
                  </div>
                  {viewRecord.originalClient.co_applicant_aadhaar && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Co-Applicant Aadhaar:</span>
                      <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.co_applicant_aadhaar}</span>
                    </div>
                  )}
                </div>
              )}
              {viewRecord.originalClient.eb_no && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>EB - Consumer No:</span>
                  <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.eb_no}</span>
                </div>
              )}
              {viewRecord.originalClient.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Billing Address:</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{viewRecord.originalClient.address}</span>
                </div>
              )}
              {viewRecord.originalClient.remarks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks:</span>
                  <span style={{ fontSize: 12.5, fontStyle: 'italic' }}>{viewRecord.originalClient.remarks}</span>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="admin-action-btn" onClick={() => setViewRecord(null)}>Close</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
