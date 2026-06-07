import React from 'react';

export default function InvestmentForm({
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
  handleCancel,
  handleResetForm,
  handleSaveInvestment
}) {
  return (
    <div className="investment-form-card">
      <div className="form-header-row">
        <div className="form-title-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{editId ? 'Modify Investment Record' : 'Investment Entry Form'}</span>
        </div>
        <span className="entry-id-badge" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {editId ? `ID: ${editId}` : 'NEW ENTRY'}
        </span>
      </div>

      <div className="investment-form-grid">
        <label>
          Partner Name *
          <input
            type="text"
            placeholder="Enter full name"
            value={partnerName}
            onChange={e => setPartnerName(e.target.value)}
          />
        </label>

        <label>
          Investment Amount (₹) *
          <input
            type="number"
            placeholder="0.00"
            value={investmentAmount}
            onChange={e => setInvestmentAmount(e.target.value)}
          />
        </label>
        
        <label className="span-2" style={{ marginTop: -8 }}>
          Google Drive Link
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={googleDriveLink}
            onChange={e => setGoogleDriveLink(e.target.value)}
          />
        </label>

        <label className="span-2">
          Investment Duration
          <select value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="6 Months">6 Months</option>
            <option value="12 Months">12 Months</option>
            <option value="24 Months">24 Months</option>
            <option value="36 Months">36 Months</option>
          </select>
        </label>

        <label>
          Partner Mobile
          <input
            type="text"
            placeholder="+91 XXXXX XXXXX"
            value={mobileNumber}
            onChange={e => setMobileNumber(e.target.value)}
          />
        </label>

        <label>
          Partner Aadhaar
          <input
            type="text"
            placeholder="XXXX XXXX XXXX"
            value={aadhaarNumber}
            onChange={e => setAadhaarNumber(e.target.value)}
          />
        </label>

        <label>
          Start Date *
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date (Auto)
          <input
            type="date"
            value={endDate}
            disabled
            style={{ background: 'var(--bg-muted)', cursor: 'not-allowed' }}
          />
        </label>

        <label>
          Partner PAN
          <input
            type="text"
            placeholder="ABCDE1234F"
            value={panNumber}
            onChange={e => setPanNumber(e.target.value)}
          />
        </label>

        <label>
          Nominee Name
          <input
            type="text"
            placeholder="Relationship Holder"
            value={nomineeName}
            onChange={e => setNomineeName(e.target.value)}
          />
        </label>

        <label className="span-2">
          Remarks
          <input
            type="text"
            placeholder="Internal notes..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </label>

        <label>
          Nominee Aadhaar
          <input
            type="text"
            placeholder="XXXX XXXX XXXX"
            value={nomineeAadhaar}
            onChange={e => setNomineeAadhaar(e.target.value)}
          />
        </label>

        <label>
          Nominee PAN
          <input
            type="text"
            placeholder="PAN NUMBER"
            value={nomineePan}
            onChange={e => setNomineePan(e.target.value)}
          />
        </label>

        <div className="span-2" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <button type="button" className="admin-action-btn" onClick={handleCancel} style={{ textDecoration: 'none', color: '#ef4444', border: 'none', background: 'transparent' }}>Cancel</button>
          <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
          <button type="button" className="admin-primary-btn" onClick={handleSaveInvestment} style={{ minWidth: 150 }}>Save Investment</button>
        </div>

        <label className="span-2" style={{ marginTop: -8 }}>
          Address
          <textarea
            rows={3}
            placeholder="Residential/Business address details..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ resize: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
