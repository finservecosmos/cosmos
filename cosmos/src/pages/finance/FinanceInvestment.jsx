import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../widgets/DashboardLayout';
import Modal from '../../shared/ui/Modal';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import useConfirm from '../../shared/lib/useConfirm';
import { useInvestment } from '../../features/partner-ledger/hooks/useInvestment';
import InvestmentForm from '../../features/partner-ledger/components/InvestmentForm';
import InvestmentTable from '../../features/partner-ledger/components/InvestmentTable';
import '../../shared/ui/DataPage.css';
import './FinanceInvestment.css';

export default function FinanceInvestment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { investments, addInvestment, updateInvestment, removeInvestment } = useAppState();

  const investmentState = useInvestment({
    investments,
    addInvestment,
    updateInvestment,
    removeInvestment,
    addToast,
    confirm
  });

  const {
    isFormOpen,
    setIsFormOpen,
    partnerName,
    setPartnerName,
    investmentAmount,
    setInvestmentAmount,
    duration,
    setDuration,
    mobileNumber,
    setMobileNumber,
    aadhaarNumber,
    setAadhaarNumber,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    panNumber,
    setPanNumber,
    nomineeName,
    setNomineeName,
    remarks,
    setRemarks,
    nomineeAadhaar,
    setNomineeAadhaar,
    nomineePan,
    setNomineePan,
    address,
    setAddress,
    googleDriveLink,
    setGoogleDriveLink,
    editId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    viewRecord,
    setViewRecord,
    totalInvestmentAmount,
    activePartnersCount,
    maturingThisMonthCount,
    paginatedRecords,
    totalPages,
    PAGE_SIZE,
    handleResetForm,
    handleCancel,
    handleSaveInvestment,
    handleEditRecord,
    handleDeleteRecord,
    handleExportCSV
  } = investmentState;

  useEffect(() => {
    document.title = 'Investment Management | Cosmos';
  }, []);

  return (
    <DashboardLayout>
      <div className="finance-investment-page">
        {/* Toggle shortcut row */}
        <div className="finance-investment-actions-row">
          <button
            type="button"
            className="data-btn data-btn-primary"
            onClick={() => {
              if (isFormOpen && editId) {
                investmentState.setEditId(null);
                handleResetForm();
              } else {
                setIsFormOpen(!isFormOpen);
              }
            }}
          >
            {isFormOpen ? '✕ Close Form' : '+ New Investment'}
          </button>
        </div>

        {/* KPI metrics row */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ +12.5% vs last month</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INVESTMENTS</div>
              <div className="kpi-value">₹{totalInvestmentAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ +4 new this week</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">ACTIVE PARTNERS</div>
              <div className="kpi-value">{activePartnersCount}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="kpi-tag critical">Action required on {maturingThisMonthCount}</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">MATURING THIS MONTH</div>
              <div className="kpi-value">{maturingThisMonthCount}</div>
            </div>
          </div>
        </div>

        {/* Collapsible Entry Form */}
        {isFormOpen && (
          <InvestmentForm
            partnerName={partnerName}
            setPartnerName={setPartnerName}
            investmentAmount={investmentAmount}
            setInvestmentAmount={setInvestmentAmount}
            duration={duration}
            setDuration={setDuration}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            panNumber={panNumber}
            setPanNumber={setPanNumber}
            nomineeName={nomineeName}
            setNomineeName={setNomineeName}
            remarks={remarks}
            setRemarks={setRemarks}
            nomineeAadhaar={nomineeAadhaar}
            setNomineeAadhaar={setNomineeAadhaar}
            nomineePan={nomineePan}
            setNomineePan={setNomineePan}
            address={address}
            setAddress={setAddress}
            googleDriveLink={googleDriveLink}
            setGoogleDriveLink={setGoogleDriveLink}
            editId={editId}
            handleCancel={handleCancel}
            handleResetForm={handleResetForm}
            handleSaveInvestment={handleSaveInvestment}
          />
        )}

        {/* Investment Records Table Card */}
        <InvestmentTable
          paginatedRecords={paginatedRecords}
          filteredRecordsCount={investmentState.filteredRecords.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          PAGE_SIZE={PAGE_SIZE}
          handleExportCSV={handleExportCSV}
          handleEditRecord={handleEditRecord}
          handleDeleteRecord={handleDeleteRecord}
          setViewRecord={setViewRecord}
        />

        {/* View Modal */}
        {viewRecord && (
          <Modal title="Investor Details View" onClose={() => setViewRecord(null)} size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Name:</span>
                <span style={{ fontWeight: 700 }}>{viewRecord.partner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Mobile:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.mobile || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner PAN Card:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.pan_card || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Aadhaar:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.aadhaar_number || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Investment Principal:</span>
                <span className="cell-amount">₹{viewRecord.amount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Accrued Interest:</span>
                <span className="cell-amount">₹{viewRecord.interest.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee Name:</span>
                <span style={{ fontWeight: 600 }}>{viewRecord.originalInvestment.nominee_name || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee PAN:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.nominee_pan || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee Aadhaar:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.nominee_aadhaar || '—'}</span>
              </div>
              {viewRecord.originalInvestment.google_drive_link && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Google Drive Link:</span>
                  <a
                    href={viewRecord.originalInvestment.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Open Google Drive 🔗
                  </a>
                </div>
              )}
              {viewRecord.originalInvestment.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Billing Address:</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{viewRecord.originalInvestment.address}</span>
                </div>
              )}
              {viewRecord.originalInvestment.remarks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks:</span>
                  <span style={{ fontSize: 12.5, fontStyle: 'italic' }}>{viewRecord.originalInvestment.remarks}</span>
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
