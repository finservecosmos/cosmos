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
import '../../shared/ui/DataPage.css';
import './FinanceEntry.css';

export default function FinanceEntry() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { clients, addClient, updateClient, investments, addTransaction, addPayment } = useAppState();

  const financeEntryState = useFinanceEntry({
    clients,
    addClient,
    updateClient,
    investments,
    addToast,
    confirm,
    addTransaction,
    addPayment
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
    googleDriveLink,
    setGoogleDriveLink,
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
    isViewMode,
    handleViewRecord,
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
    handleExportCSV,
    repaymentRecord,
    setRepaymentRecord,
    repayPrincipalPaid,
    setRepayPrincipalPaid,
    repayInterestPaid,
    setRepayInterestPaid,
    repayDate,
    setRepayDate,
    repayRemarks,
    setRepayRemarks,
    handleSaveRepayment
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="kpi-tag muted">Updated 2m ago</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">BANK ACCOUNT BALANCE</div>
              <div className="kpi-value">₹{totalInvestments.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            googleDriveLink={googleDriveLink}
            setGoogleDriveLink={setGoogleDriveLink}
            remarks={remarks}
            setRemarks={setRemarks}
            editId={editId}
            displayEntryId={displayEntryId}
            handleCancel={handleCancel}
            handleResetForm={handleResetForm}
            handleSaveEntry={handleSaveEntry}
            isViewMode={isViewMode}
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
          handleViewRecord={handleViewRecord}
          setRepaymentRecord={setRepaymentRecord}
        />

        {/* Record Repayment Modal */}
        {repaymentRecord && (
          <Modal 
            title="Record Client Repayment" 
            subtitle={`Record principal and interest payment for ${repaymentRecord.name}`}
            onClose={() => setRepaymentRecord(null)} 
            size="md"
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRepayment(); }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-surface-hover)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client Name</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{repaymentRecord.name}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Status</span>
                  <span className={`status-badge status-${repaymentRecord.status.toLowerCase()}`}>{repaymentRecord.status}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outstanding Principal</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>₹{repaymentRecord.principal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outstanding Interest</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>₹{repaymentRecord.interest.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="entry-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <label>
                  Principal Paid (₹)
                  <input
                    type="number"
                    placeholder="Enter principal amount"
                    value={repayPrincipalPaid}
                    onChange={(e) => setRepayPrincipalPaid(e.target.value)}
                    min="0"
                    max={repaymentRecord.principal}
                    step="any"
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Max: ₹{repaymentRecord.principal.toLocaleString('en-IN')}</span>
                </label>

                <label>
                  Interest Paid (₹)
                  <input
                    type="number"
                    placeholder="Enter interest amount"
                    value={repayInterestPaid}
                    onChange={(e) => setRepayInterestPaid(e.target.value)}
                    min="0"
                    max={repaymentRecord.interest}
                    step="any"
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Max: ₹{repaymentRecord.interest.toLocaleString('en-IN')}</span>
                </label>

                <label className="span-2" style={{ gridColumn: 'span 2' }}>
                  Payment Date
                  <input
                    type="date"
                    value={repayDate}
                    onChange={(e) => setRepayDate(e.target.value)}
                    required
                  />
                </label>

                <label className="span-2" style={{ gridColumn: 'span 2' }}>
                  Remarks
                  <input
                    type="text"
                    placeholder="e.g. Received partial/full repayment"
                    value={repayRemarks}
                    onChange={(e) => setRepayRemarks(e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button 
                  type="button" 
                  className="admin-action-btn" 
                  onClick={() => setRepaymentRecord(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-primary-btn"
                >
                  Record Repayment
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
